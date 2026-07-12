# DrawHeart 繪心室 - 似顏繪訂購表單

純靜態網頁（`index.html`），提交資料會寫入 Google 表單，並支援參考照片上傳到你的 Google 雲端硬碟。

## 目前狀態

- ✅ 表單已串接 Google 表單（送出後資料會出現在表單「回覆」裡）
- ✅ 圖片上傳的前端介面已完成（可拖曳、預覽、移除，最多 5 張、每張 5MB）
- ⬜ 圖片上傳的後端（Google Apps Script）需要你設定一次，步驟如下

> 圖片上傳後端還沒設定前，網站一切正常，只是訪客選了圖片送出時會被提醒「請改用 Email 附圖」。

## 一、啟用圖片上傳（約 5 分鐘）

Google 表單的「檔案上傳」題型不允許外部網站直接提交，所以改用 Apps Script 把圖片存進你的雲端硬碟，連結會自動附在表單的「備註」欄位裡。

1. **建立雲端硬碟資料夾**：到 [Google 雲端硬碟](https://drive.google.com) 建一個資料夾（例如「似顏繪客戶照片」），開啟它，複製網址最後那串英數字（就是資料夾 ID）。
   例如網址是 `https://drive.google.com/drive/folders/1AbCdEfG...`，ID 就是 `1AbCdEfG...`

2. **建立 Apps Script 專案**：到 [script.google.com](https://script.google.com) → 「新專案」，把 `upload-script.gs` 的內容全部貼上，並把第一行的 `FOLDER_ID` 換成剛才複製的資料夾 ID。

3. **部署為網頁應用程式**：右上角「部署」→「新增部署作業」→ 類型選「網頁應用程式」：
   - 執行身分：**我**
   - 誰可以存取：**所有人**（必須選這個，訪客才能上傳）
   - 按「部署」，第一次會要求授權，照著同意即可。
   - 複製產生的網址（`https://script.google.com/macros/s/.../exec`）

4. **填回網站**：打開 `index.html`，找到：
   ```js
   const UPLOAD_SCRIPT_URL = '';
   ```
   把網址貼進引號中，存檔上傳即完成。

## 二、之後想換 Google 表單怎麼改

`index.html` 的 `<script>` 開頭有一個設定區：

| 常數 | 說明 |
|---|---|
| `GOOGLE_FORM_ACTION` | 表單提交網址：把表單「預覽」網址結尾的 `viewform` 改成 `formResponse` |
| `NOTES_ENTRY_ID` | 備註欄的 entry ID（圖片連結會附加在這一欄） |
| 各輸入欄位的 `name="entry.xxx"` | 對應表單每一題的 entry ID |

**取得 entry ID 的方法**：開啟 Google 表單的「預覽」頁面 → 按 F12 開發者工具 → 搜尋 `entry.`，或填好表單按送出前用「檢視原始碼」找每題的 `entry.數字`。

## 三、公開網站的安全性說明

這個 repo / 網站是公開的，以下是各項資訊的風險評估：

- **Google 表單網址與 entry ID**：本來就是公開資訊（表單連結任何人都能拿到），無需隱藏。
- **Apps Script 網址（`UPLOAD_SCRIPT_URL`）**：無法隱藏（訪客瀏覽器必須連得到），防護做在後端：
  - 只接受圖片檔、單張 5MB 以內
  - 每日總上傳量上限 100 張（可在 `upload-script.gs` 調整 `DAILY_UPLOAD_LIMIT`）
  - 腳本只能存取你指定的那一個資料夾，碰不到雲端硬碟其他內容
  - 上傳的客戶照片**保持私有**，只有你能開啟，訪客無法瀏覽別人上傳的圖
- **Email / IG 等聯絡方式**：本來就是要給客戶看的公開資訊。
- **不要 commit 的東西**：任何 API 金鑰、密碼、客戶個資都不該出現在這個 repo。

## 四、待辦

- `index.html` 裡 Facebook 的連結還是 `href="#"`，記得換成粉絲專頁網址。
