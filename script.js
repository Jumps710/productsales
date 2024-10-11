let displayName = "";
let userId = "";

// WOFF初期化処理
const initializeWoff = () => {
    // WOFFブラウザ内で実行されているか確認
    if (!woff.isInClient()) {
        alert("この機能はLINE WORKSアプリ内でのみ使用できます。");
        return;
    }

    // ユーザーがログインしているか確認
    if (!woff.isLoggedIn()) {
        console.log("ユーザーは未ログインです。ログインページにリダイレクトします。");
        // ユーザーがログインしていない場合、ログイン処理を実行
        woff.login({
            redirectUri: window.location.href // ログイン後に現在のページにリダイレクト
        });
    } else {
        // ログイン済みならばWOFF初期化を実行
        woff
            .init({
                woffId: "Bv2kAkzN6gcZ0nD0brpMpg"
            })
            .then(() => {
                console.log("WOFF APIが正常に初期化されました。");

                // プロフィール情報を取得
                return woff.getProfile();
            })
            .then((profile) => {
                if (profile) {
                    displayName = profile.displayName;
                    userId = profile.userId;
                    console.log("ユーザー名:", displayName, "ユーザーID:", userId);
                }
            })
            .catch((err) => {
                console.error("WOFF API初期化中にエラーが発生しました:", err.code, err.message);
            });
    }
};

// ページ読み込み時にWOFFを初期化
window.onload = initializeWoff;

// フォームの送信処理
function handleSubmit(form) {
    document.getElementById('loadingMessage').textContent = "少しお待ちください...";
    document.getElementById('errorMessage').textContent = "";

    if (!userId || !displayName) {
        document.getElementById('errorMessage').textContent = "プロフィール情報が取得できていません。";
        return;
    }

    // 選択されたproductをカンマ区切りでまとめる
    const selectedProducts = Array.from(document.querySelectorAll('input[name="product"]:checked'))
        .map((checkbox) => checkbox.value)
        .join(',');

    const sfdcUrl = form.sfdcUrl.value;
    const opportunityId = extractOpportunityId(sfdcUrl);

    // フォームデータをJSON形式で準備
    const formData = {
        companyName: form.companyName.value,
        userName: displayName,  // 取得したユーザー名
        userId: userId,         // 取得したユーザーID
        product: selectedProducts,
        sfdcUrl: sfdcUrl,
        opportunityId: opportunityId
    };

    // fetchリクエストの設定
    fetch(apiEndpoint, {
        method: 'POST',  // POSTリクエスト
        headers: {
            'Content-Type': 'application/json'  // JSON形式で送信
        },
        body: JSON.stringify(formData)  // JSON形式に変換
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('errorMessage').textContent = data.message;
        } else {
            document.getElementById('loadingMessage').textContent = "支援依頼の申請が完了しました";
        }
    })
    .catch(error => {
        document.getElementById('loadingMessage').textContent = "";
        document.getElementById('errorMessage').textContent = "エラーが発生しました: " + error;
        console.error('Error:', error);  // エラーログをコンソールに表示
    });
}

// API Gatewayのエンドポイント
const apiEndpoint = 'https://00in1sa3eg.execute-api.ap-northeast-1.amazonaws.com/productsales/tossup';

// Salesforce URLからopportunityIdを抽出
function extractOpportunityId(url) {
    const regex = /\/opportunity\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
