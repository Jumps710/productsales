let displayName = "";
let userId = "";

// WOFF初期化処理
const initializeWoff = () => {
    console.log("initializeWoff: WOFF APIの初期化を開始します。");
    
    // ユーザーがログインしているか確認
    if (!woff.isLoggedIn()) {
        console.log("initializeWoff: ユーザーは未ログインです。ログインページにリダイレクトします。");
        // ユーザーがログインしていない場合、ログイン処理を実行
        woff.login({
            redirectUri: window.location.href  // ログイン後に現在のページにリダイレクト
        });
    } else {
        console.log("initializeWoff: ユーザーはログイン済みです。WOFF APIを初期化します。");

        // ログイン済みならばWOFF初期化を実行
        woff
            .init({
                woffId: "Bv2kAkzN6gcZ0nD0brpMpg"
            })
            .then(() => {
                console.log("initializeWoff: WOFF APIが正常に初期化されました。");

                // プロフィール情報を取得
                return woff.getProfile();
            })
            .then((profile) => {
                if (profile) {
                    displayName = profile.displayName;
                    userId = profile.userId;
                    console.log("initializeWoff: ユーザー名:", displayName, "ユーザーID:", userId);
                } else {
                    console.log("initializeWoff: プロフィール情報が取得できませんでした。");
                }
            })
            .catch((err) => {
                console.error("initializeWoff: WOFF API初期化中にエラーが発生しました:", err.code, err.message);
            });
    }
};

// ページ読み込み時にWOFFを初期化
window.onload = initializeWoff;

// フォームの送信処理
function handleSubmit(form) {
    console.log("handleSubmit: フォーム送信処理を開始します。");
    document.getElementById('loadingMessage').textContent = "少しお待ちください...";
    document.getElementById('errorMessage').textContent = "";

    if (!userId || !displayName) {
        document.getElementById('errorMessage').textContent = "プロフィール情報が取得できていません。";
        console.log("handleSubmit: プロフィール情報が未取得です。userId:", userId, "displayName:", displayName);
        return;
    }

    console.log("handleSubmit: プロフィール情報が確認されました。");

    // 選択されたproductをカンマ区切りでまとめる
    const selectedProducts = Array.from(document.querySelectorAll('input[name="product"]:checked'))
        .map((checkbox) => checkbox.value)
        .join(',');

    const sfdcUrl = form.sfdcUrl.value;
    const opportunityId = extractOpportunityId(sfdcUrl);

    console.log("handleSubmit: フォームデータを送信します。選択されたプロダクト:", selectedProducts, "Salesforce URL:", sfdcUrl, "Opportunity ID:", opportunityId);

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
            console.log("handleSubmit: エラーが発生しました。", data.message);
        } else {
            document.getElementById('loadingMessage').textContent = "支援依頼の申請が完了しました";
            console.log("handleSubmit: 申請が完了しました。");
        }
    })
    .catch(error => {
        document.getElementById('loadingMessage').textContent = "";
        document.getElementById('errorMessage').textContent = "エラーが発生しました: " + error;
        console.error("handleSubmit: fetchリクエスト中にエラーが発生しました。", error);
    });
}

// API Gatewayのエンドポイント
const apiEndpoint = 'https://00in1sa3eg.execute-api.ap-northeast-1.amazonaws.com/productsales/tossup';

// Salesforce URLからopportunityIdを抽出
function extractOpportunityId(url) {
    console.log("extractOpportunityId: URLからOpportunity IDを抽出します。URL:", url);
    const regex = /\/opportunity\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    const opportunityId = match ? match[1] : null;
    console.log("extractOpportunityId: 抽出されたOpportunity ID:", opportunityId);
    return opportunityId;
}
