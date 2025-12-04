import React from 'react';
import Image from 'next/image';

export const ProjectDetails: React.FC = () => {
  return (
    <div className="space-y-8 text-gray-800">
      {/* Overview Graphic */}
      <Image
        src="https://i.imgur.com/58WNi5e.jpeg"
        alt="18きっぷ遠足プロジェクト概要"
        width={1200}
        height={675}
        className="w-full rounded-lg shadow-md mb-6"
      />

      {/* Introduction */}
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          2022年にスタートした18きっぷ遠足はついに来年に5年目に突入します！これまで述べ100人近い方々にご参加いただけたこと、さらに今日の今日まで大きなケガなく旅を続けることができたのは本当に幸運という他ございません。
        </p>
        <p className="text-base leading-relaxed">
          しかし、依然として遠足開催における経費の高騰は年々悪化するばかりです。
        </p>
        <p className="text-base leading-relaxed">
          今回も旅先より直接お土産をお届けすることでその経費についての穴埋めを行いたいと思います。
        </p>
        <p className="text-base leading-relaxed">
          今回の旅先は長崎県です。実は北方領土を除いた北海道よりも海岸線の長さが長かったり、漁獲生産量が日本で2番目に多い上に、とれる魚の種類も300種類以上で堂々の1位と日本屈指の漁業地域だったりします。
        </p>
        <p className="text-base leading-relaxed font-bold">
          個人的のも長崎の海鮮が一番おいしいと胸を張って言えるので、この機会にぜひお求めくださいませ！プラットフォーム手数料がない分大変お買い得になっています！
        </p>
      </div>

      {/* Self Introduction */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          自己紹介&18きっぷ遠足をはじめたキッカケ
        </h3>
        <p className="text-base leading-relaxed">
          はじめまして。18きっぷ遠足主催の北と申します。もともと東京の塾で小学生相手に社会の先生をやっており、現在は18きっぷ遠足の企画や子ども向けにメタバースやAIを教えるような塾を自分で立ち上げて運営しています。
        </p>
        <p className="text-base leading-relaxed">
          もともと社会の先生をやっている頃に「授業（の進行やカリキュラム）に関係のない質問」や「授業中の飲食」、そしてゲームなどを禁止されていた反動から、それらを全てを推奨するご当地料理を食べながら都道府県のことを学ぶ「食べる地理講座」や遊びながら楽しく学べる歴史カードゲームなどを作って子どもたちと楽しく学ぶ場を運営していました。
        </p>
        <p className="text-base leading-relaxed">
          また、東大の数学の入試ですら退屈と感じるほど数学好きな小学生と一緒に「数学好きを増やすワークショップ」などを作ったりと、既存の先生と生徒の関係に囚われない子どもとの関わり方をしています。（僕自身、私立大学の文系なので当然彼に数学で太刀打ちできません）
        </p>
        <p className="text-base leading-relaxed">
          そんな感じで教育の業界に関わり続けて早いもので10年が経過しましたが、今回のプロジェクトでもある18きっぷ遠足は2022年に誕生しました。
        </p>
        <p className="text-base leading-relaxed">
          キッカケはあるお母さんのfacebookの投稿から。
        </p>
        <p className="text-base leading-relaxed">
          そのお子さまは自分の考えた大回りルートで1日8時間しかも鈍行列車で関西を回る旅をしていました。親御さんとしてはその旅を一人で行かせるわけにもいかないので、付き添っていたようですが、やはり普通の人にとって特急列車のような快適なシートもない普通列車に8時間も乗り続けるのはとてもしんどい様子でした。
        </p>
        <p className="text-base leading-relaxed">
          それを見て、他の保護者からも共感の声。しかし、18きっぷ歴7年でようやくその長時間乗車の魅力に気づき初めた私は「自分だったら無限に電車に乗れるから一緒に楽しめるだろう」と考え、この企画を立ち上げることにしました。
        </p>
        <p className="text-base leading-relaxed">
          その保護者の方は大喜びで僕にその子を預けてくれました。
        </p>
        <p className="text-base leading-relaxed">
          実際にやってみると、その子にとっても電車好きな人と一緒に旅をできるのは楽しかったようで、また行きたいと言っていただけました。
        </p>
        <p className="text-base leading-relaxed">
          そんな旅の様子をSNSで発信していると、「うちの子にも旅させたい！」という声が続出し、現在では鉄道好きの子もそうでない子も参加する学年ごちゃ混ぜの旅になっていました。
        </p>
      </section>

      {/* About this trip */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          今回の18きっぷ遠足について
        </h3>
        <p className="text-base leading-relaxed">
          今回は長崎を拠点に県内のさまざまな場所を巡っていきます。
        </p>
        <p className="text-base leading-relaxed">
          出発地点は博多駅（予定）
        </p>
        <p className="text-base leading-relaxed">
          そこからJR日本最西端の鉄道駅である佐世保駅に行き、
        </p>
        <Image
          src="https://assets.st-note.com/img/1763976720-y2semQJ3qfg7hBpTnKWS4Odr.png"
          alt="佐世保駅周辺の地図"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          翌日は長崎市内を観光します。
        </p>
        <Image
          src="https://assets.st-note.com/img/1763976744-A62hiaocKPOY4wXdyvDWG0UH.png"
          alt="長崎市内の地図"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          長崎県は日本の歴史上400年近く世界の玄関口となっていた経緯から通常の旅行では味わえない街の雰囲気を存分に感じることができます。
        </p>
        <Image
          src="https://assets.st-note.com/img/1763976755-vMpqaeHAUtNy4XzVLk3ojrSI.png"
          alt="長崎の街並み"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <Image
          src="https://assets.st-note.com/img/1763976765-g9Z5WcYnCBVS3D7aXlMdi8FT.png"
          alt="長崎の歴史的建造物"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          この時期にはなんとJR九州より小学生以下であればだれでも100円で電車が乗り放題になるこどもぼうけんきっぷが発売されるため、18きっぷ以上にお得に旅をすることができます。また、JR九州が事前予約などを活用すれば通常運賃よりも新幹線や特急列車に乗ったほうが安くなるという仕様から今回は特別に特急列車や新幹線を解禁し、その分現地でのアクティビティを増やすようにします。もちろん、あえて鈍行列車を使う場面もたくさんあるのでご安心を。
        </p>
      </section>

      {/* Past trips */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          過去の18きっぷ遠足の旅の様子について
        </h3>
        <p className="text-base leading-relaxed">
          18きっぷ遠足は2026年で5年目を迎えます。
        </p>
        <Image
          src="https://assets.st-note.com/img/1763976940-6vYNCPIa5t0bJhXVkHO3ZFGE.png"
          alt="過去の18きっぷ遠足の様子"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          初めは2~3人くらいの規模での開催でありましたが、その人数は徐々に増え、多いときで15名の子どもたちが参加していました。
        </p>
        <Image
          src="https://assets.st-note.com/img/1763976856-6SfnPQkmXEJzH0AOKYLopZ1G.png"
          alt="多くの子どもたちが参加している様子"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          先ほど述べたように、青春18きっぷのルールで特急列車や新幹線を一切使わずに旅をします。また、1日の食費が1500円（場合により2000円）と定められており、それをオーバーした場合には「破産」として追加で子どもたちのお年玉や親御さんから足りない分を払ってもらうことになります。
        </p>
        <p className="text-base leading-relaxed">
          ただし、旅行行程についてはその日の宿以外に決まっておらず、時刻表などを見ながらみんなでどんなことをするのかなどを決めていきます。
        </p>
        <p className="text-base leading-relaxed">
          そのため、子どもたちにとっては非常に自由度の高い旅となり、わずかな乗り換え時間の間に鬼ごっこをしたり、電車の中では自前のテーブルなどをつかってカードゲームなどで遊んだりするので、歳の離れた子たちであっても仲良くなりやすい特徴があります。
        </p>
        <p className="text-base leading-relaxed">
          つまるところ、本当にやりたいことだけをやりつづけるような旅なのです。
        </p>
        <p className="text-base leading-relaxed">
          また、私個人としても「日常泊」という考え方を進めており、短期的に観光スポットをいくつも回るよりも行きたい場所を絞って、知らない街でいつものような生活を送ることが子供達にとって印象に残りやすいと考えています。
        </p>
        <p className="text-base leading-relaxed">
          USJやディズニーランドのようなテーマパークにも行かず、元社会の先生である私のガイド付きでいろんな都道府県を回るため地理感覚などが身につきやすいです。
        </p>
        <p className="text-base leading-relaxed">
          また、特急列車や高級なホテルなども利用しないため、通常の行程よりも若干過酷であるけれども、それを乗り越えることで子どもたちが自信をつけることができます。その結果、過去に一緒に旅をした不登校の子どもほぼ全員が自分のペースではあるけれど学校に通い始める不思議な現象も起きています（学校に行くべきと一言も言っていないにもかかわらず。）
        </p>
      </section>

      {/* Challenges */}
      <section className="space-y-4">
        <p className="text-base leading-relaxed">
          しかし、そんな18きっぷ遠足ですが、今後続けていく上でいくつか課題が生じることになりました。
        </p>

        <h4 className="text-lg font-bold text-gray-900 mt-6 mb-2">
          課題その① 18きっぷリニューアル&廃止の可能性
        </h4>
        <p className="text-base leading-relaxed">
          2024年の10月、JR公式より18きっぷのリニューアルのお知らせがされました。
        </p>
        <p className="text-base leading-relaxed">
          もともと、当遠足では1枚（5日分）の18きっぷを複数人で使うことによって遠方への交通費を節約し、安価な旅を届けることができていたのですが、それができなくなってしまいました。
        </p>
        <p className="text-base leading-relaxed">
          新しい18きっぷが5日連続使用という条件となると、一人1枚ずつ切符を買わなければならないため、以前よりも切符代が割高になってしまいます。さらに子供料金で普通に切符を買った方が安いケースが多く、以前よりも行程が過酷になりがちです。
        </p>

        <h4 className="text-lg font-bold text-gray-900 mt-6 mb-2">
          課題その② インフレに伴う交通費以外の影響
        </h4>
        <p className="text-base leading-relaxed">
          コロナ禍以前、全国どこでも3000円程度で快適な宿に泊まることができていたのですが、コロナ禍が明けて以降、宿泊事業者の減少や燃料費の高騰などでその予算で宿に泊まることが難しくなってきました。
        </p>
        <p className="text-base leading-relaxed">
          また、食費に関しても以前に比べると大幅な値上げがされています。各種飲食チェーンの値上げもそうなのですが、特に旅中にみんなで料理を作って食べる機会も多いため、昨今の米の値上がりは致命的と言えるでしょう。
        </p>
        <p className="text-base leading-relaxed">
          小学校高学年以上の子達も多いため、食べ盛りなことからキッズメニューではどうしても物足りなくなるのも仕方がありません。
        </p>

        <h4 className="text-lg font-bold text-gray-900 mt-6 mb-2">
          課題その③ スケールの問題
        </h4>
        <p className="text-base leading-relaxed">
          18きっぷ遠足はその特性上、多くの人数を集めての開催が難しいです。そのため、去年の夏の以上の人数参加が難しいです。
        </p>
        <p className="text-base leading-relaxed">
          また、小さいすぎる子どもに関して6時間以上の乗車や親元を離れての宿泊に耐えるのは難しいため、参加について年齢制限を設けています。
        </p>
        <p className="text-base leading-relaxed">
          そうなると、小学校高学年の参加に絞られるのですが、彼らが子ども料金で参加できるのも2~3年程度。
        </p>
        <p className="text-base leading-relaxed">
          ありがたいことに中学生になってからも参加してくれる子たちもいるのですが、その子たちの親御さんとしても負担増は避けられません。
        </p>
      </section>

      {/* Goals */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          クラファンで実現したいこと
        </h3>
        <p className="text-base leading-relaxed">
          参加者の負担をあまり増やさずに、18きっぷ遠足を今後も続けていく上で何をすべきかと考えたときに、ふるさと納税のような形でクラウドファンディングをしていけばいいのではないかと考えました。
        </p>
        <p className="text-base leading-relaxed">
          つまるところ、旅先の美味しい海鮮や農産物をリターンとしてお届けすることで、18きっぷ遠足に直接参加する以外の方法で関わることができる仕組みを構築できればと考えました。
        </p>
        <p className="text-base leading-relaxed">
          また、既存の18きっぷ遠足に直接参加する人についても、「旅ゼミ」として月に1度のミーティングをしつつ、これから旅行する都道府県のことについて学びながらシッター代の分割払いを実現することでより参加しやすくなるのではないかと思いました。
        </p>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          ※交通費に関してはそもそも切符自体がなくなる可能性もあるので、それぞれの保護者の方に調達していただく予定です。
        </p>
        <p className="text-base leading-relaxed">
          さらに、この18きっぷ遠足自体をクラウドファンディングのプロジェクトとして活用することで、自治体提携などで宿泊場所を提供してもらえるような交渉もしていきたいと考えています。
        </p>
        <p className="text-base leading-relaxed">
          また、お金がなくて参加できないものの、独特な活動をしている小中学生に対してシッター代無料で旅に招待したいとも思っているので、その招待枠のための資金としても使いたいと考えています。
        </p>
      </section>

      {/* Returns */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          リターンについて
        </h3>
        <p className="text-base leading-relaxed">
          今回のリターンは個人的な里帰りも兼ねて平戸より直送します。
        </p>
        <p className="text-base leading-relaxed">
          平戸は日本本土最西端の鉄道駅がある場所で、広大な大陸だなによって豊かな漁場となっている東シナ海で採れた美味しい海産物をお送りいたします。
        </p>
        <Image
          src="https://i.imgur.com/cyb6OBC.png"
          alt="平戸の海産物"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          今回のクラファンのリターンは手数料無料な分、送料込みで原価率50％と通常のクラファンやふるさと納税ではありえないレベルの豪華なものを用意しているので期待して大丈夫です！
        </p>
        <p className="text-base leading-relaxed">
          また畜産物のリターンについては、近江牛と並んで日本最古の平戸牛をお届けいたします。
        </p>
        <Image
          src="https://i.imgur.com/e9DcNR0.png"
          alt="平戸牛"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
        <p className="text-base leading-relaxed">
          さらにレターパックで届く農産物やお土産のリターンもあり！
        </p>
        <p className="text-base leading-relaxed">
          長崎県民以外知らない秘密のお土産、カスドースをお届け予定！
        </p>
        <Image
          src="https://i.imgur.com/IhyLf8k.jpeg"
          alt="カスドース"
          width={1200}
          height={800}
          className="w-full rounded-lg shadow-md my-4"
        />
      </section>

      {/* Schedule */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          プロジェクトスケジュール
        </h3>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>11月下旬 プロジェクトスタート</li>
          <li>12月下旬 クラウドファンディング終了</li>
          <li>【1/4〜1/6】 企画本番（博多駅スタート予定）&リターン発送</li>
        </ul>
      </section>

      {/* Budget */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          支援金の使い道
        </h3>
        <p className="text-base font-bold">目標金額：10万円</p>
        <p className="text-base">（内訳）</p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <ul className="space-y-2 text-base">
            <li className="flex justify-between border-b border-gray-200 pb-2">
              <span>リターン仕入れ代</span>
              <span className="font-bold">3万円</span>
            </li>
            <li className="flex justify-between border-b border-gray-200 pb-2 pt-2">
              <span>リターン送料</span>
              <span className="font-bold">2万円</span>
            </li>
            <li className="flex justify-between pt-2">
              <span>18きっぷ遠足実行経費</span>
              <span className="font-bold">5万円</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-gray-600">
          ※目標金額を超えた場合は招待枠の増加および、旅のクオリティアップ（食費の増額など）に使わせていただきます。
        </p>
        <p className="text-sm text-gray-600">
          ※本プロジェクトはAll-in方式で実施します。目標金額に満たない場合も、計画を実行し、リターンをお届けします。
        </p>
      </section>

      {/* Conclusion */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
          さいごに
        </h3>
        <p className="text-base leading-relaxed">
          ここまで読んでいただきありがとうございました。
        </p>
        <p className="text-base leading-relaxed">
          18きっぷ遠足は、子どもたちにとって「自分で決めて、自分で行動する」という貴重な経験ができる場です。
        </p>
        <p className="text-base leading-relaxed">
          この活動を続けていくため、そしてより多くの子どもたちにこの経験を届けるために、皆様のお力添えをいただければ幸いです。
        </p>
        <p className="text-base leading-relaxed font-bold">
          応援よろしくお願いいたします！
        </p>
      </section>
    </div>
  );
};
