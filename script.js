function handleSubmit(form) {
    document.getElementById('loadingMessage').textContent = "少しお待ちください...";
    document.getElementById('errorMessage').textContent = "";

    // まず、プロフィール情報を取得する
    woff.getProfile()
        .then((profile) => {
            if (profile) {
                displayName = profile.displayName;
                userId = profile.userId;
                console.log("取得したユーザー名:", displayName, "取得したユーザーID:", userId);

                // 選択されたproductをカンマ区切りでまとめる
                const selectedProducts = Array.from(form.product)
                    .filter((checkbox) => checkbox.checked)
                    .map((checkbox) => checkbox.value)
                    .join(',');

                const sfdcUrl = form.sfdcUrl.value;
                const opportunityId = extractOpportunityId(sfdcUrl);

                // フォームデータをJSON形式で準備
                const formData = {
                    companyName: form.companyName.value,
                    userName: displayName, // ここで取得したユーザー名を使用
                    userId: userId,         // ここで取得したユーザーIDを使用
                    product: selectedProducts,
                    sfdcUrl: sfdcUrl,
                    opportunityId: opportunityId
                };

                // fetchリクエストの設定
                return fetch(apiEndpoint, {
                    method: 'POST',  // POSTリクエスト
                    headers: {
                        'Content-Type': 'application/json'  // JSON形式で送信
                    },
                    body: JSON.stringify(formData)  // JSON形式に変換
                });
            } else {
                throw new Error("プロフィール情報が取得できませんでした");
            }
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
