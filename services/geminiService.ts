
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { EvaluationResult } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
    type: Type.OBJECT,
    properties: {
        docDayDu: { type: Type.BOOLEAN, description: "Học sinh có đọc hết hoặc gần hết bài không? (true nếu đọc trên 80% bài, false nếu ngược lại)" },
        tongDiem: { type: Type.NUMBER, description: "Tổng điểm đánh giá trên thang 100" },
        doLuuLoat: { type: Type.NUMBER, description: "Điểm lưu loát trên thang 100" },
        phatAm: { type: Type.NUMBER, description: "Điểm phát âm trên thang 100" },
        doChinhXac: { type: Type.NUMBER, description: "Điểm chính xác (đọc đúng chữ) trên thang 100" },
        nhanXetChung: { type: Type.STRING, description: "Nhận xét chung ngắn gọn về bài đọc của học sinh" },
        tuPhatAmSai: {
            type: Type.ARRAY,
            description: "Danh sách các từ học sinh phát âm sai. Ghi lại từ học sinh đọc sai dựa trên âm thanh nghe được.",
            items: {
                type: Type.OBJECT,
                properties: {
                    tu: { type: Type.STRING, description: "Từ gốc trong văn bản" },
                    phatAmSai: { type: Type.STRING, description: "Từ mà học sinh đã phát âm sai (dựa trên audio)" },
                    suaLai: { type: Type.STRING, description: "Cách phát âm đúng" },
                },
                required: ["tu", "phatAmSai", "suaLai"],
            },
        },
        diemTichCuc: {
            type: Type.ARRAY,
            description: "Danh sách những điểm tích cực, lời khen dành cho học sinh",
            items: { type: Type.STRING },
        },
    },
    required: ["docDayDu", "tongDiem", "doLuuLoat", "phatAm", "doChinhXac", "nhanXetChung", "tuPhatAmSai", "diemTichCuc"],
};


export async function evaluateReading(passageText: string, audioBase64: string, mimeType: string): Promise<EvaluationResult> {
    try {
        const prompt = `Bạn là một giám khảo chấm thi đọc Tiếng Việt cho học sinh lớp 2, yêu cầu sự chính xác và nghiêm khắc.
        Nhiệm vụ của bạn là đánh giá khả năng đọc của một học sinh dựa trên đoạn văn gốc và file ghi âm.
        
        QUY TẮC BẮT BUỘC:
        1.  **Kiểm tra độ đầy đủ:** Đầu tiên, xác định học sinh có đọc hết bài không. Nếu học sinh chỉ đọc dưới 80% bài, hãy đặt "docDayDu" thành false, cho tất cả các điểm thành 0, và đặt "nhanXetChung" là "Em chưa đọc hết bài. Vui lòng đọc lại toàn bộ bài để được chấm điểm nhé.". Trong trường hợp này, không cần nhận xét gì thêm và trả về các mảng rỗng.
        2.  **Chấm điểm nghiêm ngặt (nếu đọc đủ bài):** Nếu "docDayDu" là true, hãy chấm điểm theo thang điểm 100 với các tiêu chí sau:
            - **Độ chính xác (tối đa 40 điểm):** Đây là phần quan trọng nhất. Mỗi lỗi đọc sai từ, thiếu từ, hoặc thừa từ so với văn bản gốc, trừ 2 điểm.
            - **Phát âm (tối đa 30 điểm):** Đánh giá sự tròn vành, rõ chữ. Trừ điểm nặng cho các lỗi phát âm phổ biến (l/n, s/x, tr/ch, r/d/gi, dấu hỏi/ngã). Mỗi lỗi trừ 1-2 điểm tùy mức độ.
            - **Độ lưu loát (tối đa 30 điểm):** Đánh giá tốc độ đọc phù hợp (khoảng 50-70 từ/phút), và việc ngắt nghỉ đúng ở dấu câu. Mỗi lần đọc vấp, ngập ngừng, lặp lại từ, trừ 1 điểm.
        3.  **Nhận xét:** Đưa ra nhận xét cụ thể. Với mỗi từ sai, hãy xác định chính xác học sinh đã đọc sai thành gì và điền vào trường "phatAmSai". Ví dụ, nếu từ gốc là "nói" và học sinh đọc là "lói", thì "tu" là "nói", "phatAmSai" là "lói", và "suaLai" là "nói".
        
        Đoạn văn gốc: "${passageText}"
        
        Hãy phân tích file ghi âm và trả về kết quả dưới dạng JSON theo schema đã cung cấp.`;

        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType: mimeType,
            },
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, audioPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as EvaluationResult;
        return result;

    } catch (error) {
        console.error("Error evaluating reading:", error);
        throw new Error("Không thể phân tích bài đọc. Vui lòng thử lại.");
    }
}

export async function generateSpeech(text: string): Promise<string> {
    try {
        // FIX: The previous "simplified" prompt was likely too ambiguous for the TTS model.
        // Adding a clear instruction tells the model exactly what to do with the text.
        const instructedText = `Đọc: ${text}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: instructedText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        // FIX: Use a more robust way to find the audio data in the response.
        const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        const base64Audio = audioPart?.inlineData?.data;

        if (!base64Audio) {
            console.error("TTS API did not return audio data. Response:", JSON.stringify(response, null, 2));
            throw new Error("Không nhận được dữ liệu âm thanh từ API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Không thể tạo giọng đọc mẫu. Vui lòng thử lại.");
    }
}