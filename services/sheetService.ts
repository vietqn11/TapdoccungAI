import type { EvaluationResult, Passage, StudentInfo } from '../types';

/**
 * !!! CẤU HÌNH GOOGLE APPS SCRIPT !!!
 *
 * Để lưu kết quả vào Google Sheet, bạn cần triển khai một Google Apps Script
 * và dán URL của nó vào biến APPS_SCRIPT_URL bên dưới.
 * 
 * Ứng dụng sẽ hiển thị hướng dẫn chi tiết khi khởi động nếu URL này chưa được cấu hình.
 */
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaIW0K7t_0Nm5qA5_gycFydDoLWvlaItwk3obV7hjr7Hqx37luVBX7Y-SlsGbYgoRYRw/exec'; // <-- URL đã được cập nhật

export async function saveEvaluationToSheet(
  studentInfo: StudentInfo,
  passage: Passage,
  result: EvaluationResult
): Promise<void> {
    // Fix: The original comparison was against a placeholder string that has been replaced.
    // This simplifies the check to only verify if the URL is configured.
    if (!APPS_SCRIPT_URL) {
        console.warn('URL Google Apps Script chưa được cấu hình. Bỏ qua việc lưu vào Sheet.');
        // Ném lỗi để giao diện người dùng có thể xử lý
        throw new Error('URL_NOT_CONFIGURED');
    }

    const formData = new FormData();
    formData.append('name', studentInfo.name);
    formData.append('class', studentInfo.class);
    formData.append('passageTitle', passage.title);
    formData.append('totalScore', result.tongDiem.toString());
    formData.append('fluency', result.doLuuLoat.toString());
    formData.append('pronunciation', result.phatAm.toString());
    formData.append('accuracy', result.doChinhXac.toString());
    formData.append('generalFeedback', result.nhanXetChung);
    formData.append('positivePoints', result.diemTichCuc.join('; '));
    formData.append('wordsToImprove', result.tuPhatAmSai.map(w => `${w.tu} -> ${w.suaLai}`).join('; '));

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
        });

        const responseData = await response.json();

        if (responseData.result !== 'success') {
            throw new Error(responseData.message || 'Lỗi không xác định từ Apps Script');
        }
    } catch (error) {
        console.error("Lỗi khi lưu vào Google Sheet:", error);
        throw new Error("Không thể lưu kết quả vào Google Sheet.");
    }
}