let displayName = "";
let userId = "";

let woffId = 'WyGFfIqqOXlC4uCZIuUFuw' // lwd-test.by-works.comよう


window.addEventListener('load', () => {
    console.log("Window Loaded");

    woff.init({
        woffId: woffId // Dev Consoleにて発行された WOFF ID を指定
    })
        .then(() => {
            console.log("WOFF initialization success");
            // `woff.init` の初期化が成功した後、ログイン状態を確認
            if (woff.isInClient()) {
                // インアプリブラウザ内であればログインプロセスをスキップ
                console.log("In LINE WORKS app, no need to login.");
                sessionStorage.setItem("loggedIn", "true");
                return Promise.resolve();
            } else if (sessionStorage.getItem("loggedIn") === "true") {
                // セッションストレージにログイン済みのフラグがあれば、ログインプロセスをスキップ
                console.log("Already logged in, skipping login process.");
                return Promise.resolve();
            } else {
                // 外部ブラウザであり、かつログインしていない場合はログインが必要
                console.log("Logging in...");
                return woff.login();
            }
        })
        .then(() => {
            // ログイン成功、またはログイン不要の場合、プロフィール情報を取得
            sessionStorage.setItem("loggedIn", "true"); // ログインが成功したことをフラグで示す
            return woff.getProfile();
        })
        .then(profile => {
            userName = profile.displayName;
            userId = profile.userId;
            document.querySelector('.form-title').innerHTML = `${userName}さん、こんにちは！<br><span style="color: green; font-weight: bold;">経費精算</span>を行ってください`;
            console.log("User's display name:", userName);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
});


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
