// src/lib/jpyc/jpycService.ts

import { Contract, Provider, isAddress, TypedDataEncoder } from 'ethers';
import { JPYC_ABI } from './abi';

const JPYC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_JPYC_TOKEN_ADDRESS || '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29';

interface PermitSignatureResult {
  v: number;
  r: string;
  s: string;
  nonce: string;
  signature?: string;  // 署名全体（オプション）
}

export const jpycService = {
  async getBalance(account: string, provider: Provider): Promise<string> {
    try {
      const contract = new Contract(JPYC_TOKEN_ADDRESS, JPYC_ABI, provider);

      const balance = await contract.balanceOf(account);
      console.log(`💰 JPYC残高: ${balance.toString()} wei`);
      return balance.toString();
    } catch (error) {
      console.error('❌ 残高取得エラー:', error);
      throw error;
    }
  },

  async generatePermitSignature(
    owner: string,
    spender: string,
    amount: string,
    deadline: number,
    signer: any
  ): Promise<PermitSignatureResult> {
    try {
      // 入力値バリデーションを追加
      if (!isAddress(owner)) throw new Error('Invalid owner address');
      if (!isAddress(spender)) throw new Error('Invalid spender address');
      try {
        if (BigInt(amount) <= BigInt(0)) throw new Error();
      } catch {
        throw new Error('Amount must be a positive integer string');
      }

      const provider = signer.provider;
      const contract = new Contract(JPYC_TOKEN_ADDRESS, JPYC_ABI, provider);

      // Chain ID を動的に取得
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      console.log(`🔗 Current Chain ID for signature: ${chainId}`);

      // Nonce 取得
      const nonce = await contract.nonces(owner);
      const nonceString = nonce.toString();
      console.log(`📝 Nonce: ${nonceString}`);

      // Domain データ構築
      const domain = {
        name: 'JPY Coin',
        version: '1',
        chainId: chainId,
        verifyingContract: JPYC_TOKEN_ADDRESS,
      };

      console.log(' フロント側 Domain:');
      console.log(JSON.stringify(domain, null, 2));
      console.log('- name:', domain.name);
      console.log('- version:', domain.version);
      console.log('- chainId:', domain.chainId);
      console.log('- verifyingContract:', domain.verifyingContract);

      // EIP-712 型定義
      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      // 署名データ
      const value = {
        owner,
        spender,
        value: amount,
        nonce: nonceString,
        deadline,
      };

      console.log('📋 署名データ:', value);

      // Digest を計算してログ出力（デバッグ用）
      const digest = TypedDataEncoder.hash(domain, types, value);
      console.log('✅ Digest calculated (フロント側):', digest);
      console.log(' Digest計算に使用した値:');
      console.log('- Domain:', JSON.stringify(domain));
      console.log('- Types:', JSON.stringify(types));
      console.log('- Value:', JSON.stringify(value));

      // EIP-712 署名
      const signature = await signer.signTypedData(domain, types, value);
      console.log(`✅ 署名完了: ${signature}`);

      // 署名を r, s, v に分解
      const sig = signature.slice(2);
      const r = '0x' + sig.slice(0, 64);
      const s = '0x' + sig.slice(64, 128);
      const v = parseInt(sig.slice(128, 130), 16);

      console.log(`✅ 署名分解: v=${v}, r=${r.slice(0, 10)}..., s=${s.slice(0, 10)}...`);

      return {
        v,
        r,
        s,
        nonce: nonceString,
        signature: signature  // 署名全体も含める（デバッグ用）
      };
    } catch (error) {
      console.error('❌ 署名生成エラー:', error);
      throw error;
    }
  },

  async simpleTransfer(to: string, amount: string, signer: any): Promise<string> {
    try {
      const contract = new Contract(JPYC_TOKEN_ADDRESS, JPYC_ABI, signer);
      console.log(`💸 Transfer 実行: ${to} へ ${amount} wei`);

      const tx = await contract.transfer(to, amount);
      console.log(`⏳ トランザクション: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Transfer 完了: ${receipt?.transactionHash}`);

      return tx.hash;
    } catch (error) {
      console.error('❌ Transfer エラー:', error);
      throw error;
    }
  },

  async approveAndTransfer(to: string, amount: string, signer: any): Promise<string> {
    try {
      const contract = new Contract(JPYC_TOKEN_ADDRESS, JPYC_ABI, signer);
      const userAddress = await signer.getAddress();

      // Step 1: Approve
      console.log(`✅ Approve 実行: ${to} に ${amount} wei`);
      const approveTx = await contract.approve(to, amount);
      const approveReceipt = await approveTx.wait();
      console.log(`✅ Approve 完了: ${approveReceipt?.transactionHash}`);

      // Step 2: TransferFrom
      console.log(`💸 TransferFrom 実行: ${userAddress} から ${to} へ ${amount} wei`);
      const transferTx = await contract.transferFrom(userAddress, to, amount);
      const transferReceipt = await transferTx.wait();
      console.log(`✅ TransferFrom 完了: ${transferReceipt?.transactionHash}`);

      return transferTx.hash;
    } catch (error) {
      console.error('❌ Approve + TransferFrom エラー:', error);
      throw error;
    }
  },

  async allowance(owner: string, spender: string, provider: Provider): Promise<string> {
    try {
      const contract = new Contract(JPYC_TOKEN_ADDRESS, JPYC_ABI, provider);

      const amount = await contract.allowance(owner, spender);
      console.log(`📊 Allowance: ${amount.toString()}`);
      return amount.toString();
    } catch (error) {
      console.error('❌ Allowance 取得エラー:', error);
      throw error;
    }
  },
};