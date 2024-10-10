// WOFF初期化処理
let displayName = "";
let userId = "";

const initializeWoff = () => {
    woff
        .init({
            woffId: "RdSc-crgM_WXxb1wA9RrpQ"
        })
        .then(() => {
            console.log("WOFF APIが正常に初期化されました。");

            if (!woff.isInClient()) {
                alert("この機能はLINE WORKSアプリ内でのみ使用できます。");
                return;
            }

            return woff.getProfile();
        })
        .then((profile) => {
            if (profile) {
                displayName = profile.displayName;
                userId = profile.userId;
                console.log("取得したユーザー名:", displayName, "ユーザーID:", userId);
            }
        })
        .catch((err) => {
            console.error("WOFF APIの初期化中にエラーが発生しました:", err.code, err.message);
        });
};

// WOFF初期化の呼び出し
initializeWoff();

// API Gatewayのエンドポイント
const apiEndpoint = 'https://00in1sa3eg.execute-api.ap-northeast-1.amazonaws.com/productsales/tossup';

function handleSubmit(form) {
    document.getElementById('loadingMessage').textContent = "少しお待ちください...";
    document.getElementById('errorMessage').textContent = "";

    // 選択されたproductをカンマ区切りでまとめる
    const selectedProducts = Array.from(form.product)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value)
        .join(',');

    const sfdcUrl = form.sfdcUrl.value;
    const opportunityId = extractOpportunityId(sfdcUrl);

    // リクエストに必要なデータを準備
    const formData = {
        companyName: form.companyName.value,
        userName: displayName,
        userId: userId, // userIdを含める
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


// Salesforce URLからopportunityIdを抽出
function extractOpportunityId(url) {
    const regex = /\/opportunity\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
