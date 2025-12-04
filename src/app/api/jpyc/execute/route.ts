import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { JPYC_ABI } from '@/lib/jpyc/abi';

export async function POST(request: Request) {
  try {
    console.log('🚀 =================================');
    console.log('🚀 JPYC EXECUTE API CALLED');
    console.log('🚀 =================================');

    let body;
    try {
      body = await request.json();
      console.log('✅ JSON parsing successful');
    } catch (jsonError: unknown) {
      console.error('❌ JSON Parse Error:', jsonError instanceof Error ? jsonError.message : String(jsonError));
      return NextResponse.json({
        success: false,
        error: 'リクエストボディのJSONパースに失敗しました',
        debug: { step: 'json_parse', error: jsonError instanceof Error ? jsonError.message : String(jsonError) }
      }, { status: 400 });
    }

    const { owner, spender, receiver, amount, deadline, nonce, signature, orderId } = body;

    console.log('📝 Request Body:');
    console.log('- Owner:', owner);
    console.log('- Spender:', spender);
    console.log('- Receiver:', receiver);
    console.log('- Amount:', amount);
    console.log('- Deadline:', deadline);
    console.log('- Nonce:', nonce);

    // バリデーション
    if (!owner || !spender || !receiver || !amount || !deadline || !nonce || !signature) {
      console.error('❌ Missing required fields');
      return NextResponse.json({
        success: false,
        error: '必須フィールドが不足しています',
        debug: {
          step: 'validation',
          owner: !!owner,
          spender: !!spender,
          receiver: !!receiver,
          amount: !!amount,
          deadline: !!deadline,
          nonce: !!nonce,
          signature: !!signature
        }
      }, { status: 400 });
    }

    if (!signature.v || !signature.r || !signature.s) {
      console.error('❌ Signature fields missing');
      return NextResponse.json({
        success: false,
        error: 'Signature の v, r, s が正しくありません',
        debug: { step: 'signature_validation', signature }
      }, { status: 400 });
    }

    // 環境変数チェック
    const BACKEND_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;
    const JPYC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_JPYC_TOKEN_ADDRESS;
    const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

    if (!BACKEND_PRIVATE_KEY || !JPYC_TOKEN_ADDRESS || !POLYGON_RPC_URL) {
      return NextResponse.json({
        success: false,
        error: '環境変数が設定されていません'
      }, { status: 500 });
    }

    // Deadline チェック
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (deadline < currentTimestamp) {
      console.error('❌ Deadline expired');
      return NextResponse.json({
        success: false,
        error: '署名の有効期限が切れています',
        debug: { step: 'deadline_check', deadline, currentTimestamp }
      }, { status: 400 });
    }

    // Provider & Signer セットアップ
    console.log('🔗 =================================');
    console.log('🔗 CONNECTING TO POLYGON');
    console.log('🔗 =================================');
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);

    // Spender 検証
    if (spender.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('❌ Spender mismatch');
      return NextResponse.json({
        success: false,
        error: 'Spender アドレスが一致しません',
        debug: {
          step: 'spender_validation',
          expected: wallet.address,
          received: spender
        }
      }, { status: 400 });
    }

    const contract = new ethers.Contract(JPYC_TOKEN_ADDRESS, JPYC_ABI, wallet);

    // MATIC 残高確認
    const maticBalance = await provider.getBalance(wallet.address);
    console.log('💰 Backend MATIC balance:', ethers.formatEther(maticBalance), 'MATIC');
    if (maticBalance === BigInt(0)) {
      console.error('❌ Backend wallet has no MATIC');
      return NextResponse.json({
        success: false,
        error: 'バックエンドウォレットのMATIC残高がありません',
        debug: { step: 'matic_balance_check', balance: maticBalance.toString() }
      }, { status: 500 });
    }

    // ========== EIP-712 署名検証 ==========
    console.log('🔐 =================================');
    console.log('🔐 VERIFYING EIP-712 SIGNATURE');
    console.log('🔐 =================================');

    try {
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      console.log('Current Chain ID:', currentChainId);

      const EXPECTED_CHAIN_ID = 137;
      if (currentChainId !== EXPECTED_CHAIN_ID) {
        throw new Error(`Wrong chain. Expected ${EXPECTED_CHAIN_ID}, got ${currentChainId}`);
      }

      const domain = {
        name: 'JPY Coin',
        version: '1',
        chainId: currentChainId,
        verifyingContract: JPYC_TOKEN_ADDRESS,
      };

      console.log(' バックエンド側 Domain:');
      console.log(JSON.stringify(domain, null, 2));
      console.log('- name:', domain.name);
      console.log('- version:', domain.version);
      console.log('- chainId:', domain.chainId);
      console.log('- verifyingContract:', domain.verifyingContract);

      // Domain の DOMAIN_SEPARATOR を計算してログ出力
      const domainSeparator = ethers.TypedDataEncoder.hashDomain(domain);
      console.log('Domain Separator:', domainSeparator);

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const value = {
        owner,
        spender,
        value: amount,
        nonce: nonce,
        deadline,
      };

      // ハッシュ計算
      try {
        console.log(' 署名検証用データ:');
        console.log('- Domain:', JSON.stringify(domain));
        console.log('- Types:', JSON.stringify(types));
        console.log('- Value:', JSON.stringify(value));

        const digest = ethers.TypedDataEncoder.hash(domain, types, value);
        console.log('✅ Digest calculated:', digest);
        console.log(' Signature components:');
        console.log('- v:', signature.v);
        console.log('- r:', signature.r);
        console.log('- s:', signature.s);

        const recoveredAddress = ethers.recoverAddress(digest, {
          v: signature.v,
          r: signature.r,
          s: signature.s,
        });

        console.log('✅ Recovered address:', recoveredAddress);
        console.log(' Address comparison:');
        console.log('- Recovered:', recoveredAddress.toLowerCase());
        console.log('- Expected (owner):', owner.toLowerCase());
        console.log('- Match:', recoveredAddress.toLowerCase() === owner.toLowerCase());

        if (recoveredAddress.toLowerCase() !== owner.toLowerCase()) {
          throw new Error('Signature does not match owner');
        }

        console.log('✅ Signature verified successfully');
      } catch (verifyError: unknown) {
        console.error('❌ Signature verification failed:', verifyError instanceof Error ? verifyError.message : String(verifyError));
        throw new Error(`Signature verification failed: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`);
      }
    } catch (error: unknown) {
      console.error('❌ EIP-712 verification error:', error instanceof Error ? error.message : String(error));
      return NextResponse.json({
        success: false,
        error: 'EIP-712 署名の検証に失敗しました',
        debug: {
          step: 'eip712_verification',
          error: error instanceof Error ? error.message : String(error)
        }
      }, { status: 400 });
    }

    // ========== Nonce 再確認 ==========
    console.log('🔍 =================================');
    console.log('🔍 CHECKING NONCE');
    console.log('🔍 =================================');

    try {
      const contractNonce = await contract.nonces(owner);
      const contractNonceStr = contractNonce.toString();
      console.log('Contract nonce for owner:', contractNonceStr);
      console.log('Nonce from signature:', nonce);

      if (contractNonceStr !== nonce) {
        console.warn('🚨 Nonce mismatch!');
        return NextResponse.json({
          success: false,
          error: `Nonce が一致しません。コントラクトは Nonce ${contractNonceStr} を期待していますが、署名は Nonce ${nonce} で作成されました`,
          debug: {
            step: 'nonce_mismatch',
            expected: contractNonceStr,
            received: nonce
          }
        }, { status: 409 });
      }

      console.log('✅ Nonce matches');
    } catch (nonceError: unknown) {
      console.error('❌ Nonce check error:', nonceError instanceof Error ? nonceError.message : String(nonceError));
      return NextResponse.json({
        success: false,
        error: 'Nonce の確認に失敗しました',
        debug: { step: 'nonce_check', error: nonceError instanceof Error ? nonceError.message : String(nonceError) }
      }, { status: 500 });
    }

    // ========== Step 1: Permit 実行 ==========
    console.log('📝 =================================');
    console.log('📝 STEP 1: EXECUTING PERMIT');
    console.log('📝 =================================');

    let permitTxHash: string;

    try {
      console.log('Calling permit with:');
      console.log('- owner:', owner);
      console.log('- spender:', spender);
      console.log('- amount:', amount);
      console.log('- deadline:', deadline);
      console.log('- v:', signature.v);
      console.log('- r:', signature.r);
      console.log('- s:', signature.s);

      const permitTx = await contract.permit(
        owner,
        spender,
        amount,
        deadline,
        signature.v,
        signature.r,
        signature.s
      );

      console.log('⏳ Permit transaction sent:', permitTx.hash);
      console.log('⏳ Waiting for confirmation (1 block)...');

      // ⚡ 改善: wait(1) に変更 = 1ブロック確認のみ (ウズラの 30秒 → 5秒に短縮)
      const permitReceipt = await permitTx.wait(1);
      if (!permitReceipt) {
        throw new Error('Permit transaction receipt is null');
      }

      permitTxHash = permitReceipt.hash;
      console.log('✅ Permit confirmed:', permitTxHash);
      console.log('✅ Permit block number:', permitReceipt.blockNumber);
    } catch (permitError: unknown) {
      console.error('❌ PERMIT EXECUTION ERROR:', permitError instanceof Error ? permitError.message : String(permitError));
      console.error('Error reason:', (permitError as { reason?: string }).reason);
      console.error('Error code:', (permitError as { code?: string }).code);

      let errorMessage = 'Permit トランザクションの実行に失敗しました';
      const errorMsg = (permitError instanceof Error ? permitError.message : '').toLowerCase();
      const errorReason = ((permitError as { reason?: string }).reason || '').toLowerCase();

      if (errorMsg.includes('nonce') || errorReason.includes('nonce')) {
        errorMessage = 'Nonce が無効か、既に使用されています';
      } else if (errorMsg.includes('signature') || errorReason.includes('signature')) {
        errorMessage = '署名が無効です';
      } else if (errorMsg.includes('deadline') || errorReason.includes('deadline')) {
        errorMessage = '署名の有効期限が切れています';
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        debug: {
          step: 'permit',
          errorMessage: permitError instanceof Error ? permitError.message : String(permitError),
          errorReason: (permitError as { reason?: string }).reason,
          errorCode: (permitError as { code?: string }).code
        }
      }, { status: 500 });
    }

    // ========== Step 2: TransferFrom 実行 ==========
    console.log('💸 =================================');
    console.log('💸 STEP 2: EXECUTING TRANSFERFROM');
    console.log('💸 =================================');

    let transferTxHash: string;

    try {
      console.log('Calling transferFrom with:');
      console.log('- from (owner):', owner);
      console.log('- to (receiver):', receiver);
      console.log('- amount:', amount);

      const transferTx = await contract.transferFrom(owner, receiver, amount);
      console.log('⏳ TransferFrom transaction sent:', transferTx.hash);
      console.log('⏳ Waiting for confirmation (1 block)...');

      // ⚡ 改善: wait(1) に変更
      const transferReceipt = await transferTx.wait(1);
      if (!transferReceipt) {
        throw new Error('TransferFrom transaction receipt is null');
      }

      transferTxHash = transferReceipt.hash;
      console.log('✅ TransferFrom confirmed:', transferTxHash);
      console.log('✅ TransferFrom block number:', transferReceipt.blockNumber);
    } catch (transferError: unknown) {
      console.error('❌ TRANSFER EXECUTION ERROR:', transferError instanceof Error ? transferError.message : String(transferError));
      console.error('Error reason:', (transferError as { reason?: string }).reason);
      console.error('Error code:', (transferError as { code?: string }).code);

      return NextResponse.json({
        success: false,
        error: 'TransferFrom トランザクションの実行に失敗しました',
        debug: {
          step: 'transferFrom',
          errorMessage: transferError instanceof Error ? transferError.message : String(transferError),
          errorReason: (transferError as { reason?: string }).reason,
          permitTxHash
        }
      }, { status: 500 });
    }

    // ========== 成功レスポンス ==========
    console.log('🎉 =================================');
    console.log('🎉 TRANSACTION SUCCESS');
    console.log('🎉 =================================');
    console.log('Permit TX:', permitTxHash);
    console.log('TransferFrom TX:', transferTxHash);

    return NextResponse.json({
      success: true,
      message: 'トランザクション実行成功',
      permitTxHash,
      transferTxHash,
      transactionHash: transferTxHash,
      debug: {
        owner,
        receiver,
        amount,
        orderId
      }
    });

  } catch (error: unknown) {
    console.error('❌ =================================');
    console.error('❌ UNEXPECTED ERROR');
    console.error('❌ =================================');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : undefined);

    return NextResponse.json({
      success: false,
      error: '予期しないエラーが発生しました',
      debug: {
        step: 'catch_all',
        message: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 });
  }
}
