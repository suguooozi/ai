/**
 * DrawHeart 繪心室 - 圖片上傳後端（Google Apps Script）
 *
 * 功能：接收網站傳來的圖片（base64），存到你指定的雲端硬碟資料夾，
 *       並回傳可檢視的連結，網站會把連結附在 Google 表單的備註欄送出。
 *
 * 設定步驟請見 README.md
 */

// ★ 請填入你的雲端硬碟資料夾 ID（開啟資料夾時網址最後那串英數字）
const FOLDER_ID = '1raMI68dNp3I3XtutiAto7c48kjV6EfIJ';

// 單檔大小上限（與網頁端一致：5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 每日上傳張數上限（防止有人惡意灌爆雲端硬碟，正常客戶用不到這麼多）
const DAILY_UPLOAD_LIMIT = 100;

function doPost(e) {
  try {
    // 每日總量檢查
    const props = PropertiesService.getScriptProperties();
    const today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
    const countKey = 'uploads_' + today;
    const count = Number(props.getProperty(countKey) || 0);
    if (count >= DAILY_UPLOAD_LIMIT) {
      return jsonResponse({ ok: false, error: '今日上傳量已達上限，請改用 Email 附圖' });
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.base64 || !data.fileName || !data.mimeType) {
      return jsonResponse({ ok: false, error: '缺少必要欄位' });
    }
    if (!data.mimeType.startsWith('image/')) {
      return jsonResponse({ ok: false, error: '只接受圖片檔案' });
    }

    const bytes = Utilities.base64Decode(data.base64);
    if (bytes.length > MAX_FILE_SIZE) {
      return jsonResponse({ ok: false, error: '檔案超過 5MB' });
    }

    // 檔名加上時間戳記，避免重複
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd-HHmmss');
    const fileName = timestamp + '_' + data.fileName;

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(bytes, data.mimeType, fileName);
    const file = folder.createFile(blob);
    // 檔案保持私有：只有你（雲端硬碟擁有者）能開啟，保護客戶照片隱私

    props.setProperty(countKey, String(count + 1));

    return jsonResponse({ ok: true, url: file.getUrl() });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
