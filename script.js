"use strict";

/*
=========================================================
 AI – TẠO PROMPT PHIẾU BÀI TẬP
 script.js
=========================================================

Chức năng chính:

1. Quản lý form.
2. Đọc prompt mẫu.
3. Cho phép tải prompt mẫu.
4. Cho phép dán prompt mẫu.
5. Đọc một số loại file văn bản.
6. Tạo prompt từ template.
7. Sao chép prompt.
8. Tải prompt TXT.
9. Hiển thị chế độ API nâng cao.
10. Chuẩn bị kiến trúc cho AI Provider.

Lưu ý:
- Không hard-code API key.
- Không lưu API key vào localStorage.
- Chế độ tạo prompt không cần API.
*/


/* =====================================================
   STATE
===================================================== */

const state = {

    promptTemplate: "",

    promptTemplateSource: "",

    files: [],

    generatedPrompt: "",

    apiKey: "",

    apiConnected: false,

    resultData: null,

    showAnswers: false

};


/* =====================================================
   DOM HELPERS
===================================================== */

function $(id) {
    return document.getElementById(id);
}


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    setupEvents();

    updateQuestionTypeUI();

    updateDifficultyTotal();

    await loadDefaultPrompt();

}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {

    $("subject").addEventListener(
        "change",
        handleSubjectChange
    );

    $("enableMCQ").addEventListener(
        "change",
        updateQuestionTypeUI
    );

    $("enableTF").addEventListener(
        "change",
        updateQuestionTypeUI
    );

    $("enableShort").addEventListener(
        "change",
        updateQuestionTypeUI
    );


    [
        "nb",
        "th",
        "vd",
        "vdc"
    ].forEach(id => {

        $(id).addEventListener(
            "input",
            updateDifficultyTotal
        );

    });


    $("sourceFiles").addEventListener(
        "change",
        handleSourceFiles
    );

    $("promptFile").addEventListener(
        "change",
        handlePromptFile
    );


    $("useDefaultPrompt").addEventListener(
        "click",
        loadDefaultPrompt
    );


    $("clearPrompt").addEventListener(
        "click",
        clearPromptTemplate
    );


    $("generatePrompt").addEventListener(
        "click",
        generatePrompt
    );


    $("copyPrompt").addEventListener(
        "click",
        copyGeneratedPrompt
    );


    $("downloadPrompt").addEventListener(
        "click",
        downloadPrompt
    );


    $("loadSample").addEventListener(
        "click",
        loadSampleData
    );


    $("resetForm").addEventListener(
        "click",
        resetForm
    );


    $("toggleApi").addEventListener(
        "click",
        toggleApiPanel
    );


    $("apiKey").addEventListener(
        "input",
        function () {

            state.apiKey = this.value;
            state.apiConnected = false;

        }
    );


    $("testApi").addEventListener(
        "click",
        testApiConnection
    );


    $("generateDirect").addEventListener(
        "click",
        generateDirectWorksheet
    );


    $("showAnswer").addEventListener(
        "click",
        toggleAnswers
    );


    $("printWorksheet").addEventListener(
        "click",
        () => window.print()
    );

}


/* =====================================================
   SUBJECT
===================================================== */

function handleSubjectChange() {

    const value = $("subject").value;

    if (value === "custom") {

        $("customSubjectGroup")
            .classList.remove("hidden");

    } else {

        $("customSubjectGroup")
            .classList.add("hidden");

    }
}


function getSubject() {

    const value = $("subject").value;

    if (value === "custom") {

        return $("customSubject").value.trim();

    }

    return value.trim();
}


/* =====================================================
   QUESTION TYPE UI
===================================================== */

function updateQuestionTypeUI() {

    const tfEnabled = $("enableTF").checked;
    const shortEnabled = $("enableShort").checked;

    $("tfCount").disabled = !tfEnabled;
    $("shortCount").disabled = !shortEnabled;

    if (tfEnabled) {

        $("tfSettings")
            .classList.remove("hidden");

    } else {

        $("tfSettings")
            .classList.add("hidden");

    }

    if (shortEnabled) {

        $("shortSettings")
            .classList.remove("hidden");

    } else {

        $("shortSettings")
            .classList.add("hidden");

    }
}


/* =====================================================
   QUESTION COUNTS
===================================================== */

function getQuestionConfiguration() {

    const types = [];

    let total = 0;

    if ($("enableMCQ").checked) {

        const count = getPositiveInteger(
            $("mcqCount").value
        );

        types.push({
            type: "multiple_choice",
            name: "Trắc nghiệm 4 lựa chọn",
            count
        });

        total += count;
    }


    if ($("enableTF").checked) {

        const count = getPositiveInteger(
            $("tfCount").value
        );

        types.push({
            type: "true_false",
            name: "Đúng / Sai – 4 mệnh đề",
            count,
            statementsPerQuestion: 4
        });

        total += count;
    }


    if ($("enableShort").checked) {

        const count = getPositiveInteger(
            $("shortCount").value
        );

        types.push({
            type: "short_answer",
            name: "Trả lời ngắn – đáp số",
            count
        });

        total += count;
    }


    return {
        types,
        total
    };
}


function getPositiveInteger(value) {

    const n = parseInt(value, 10);

    if (Number.isNaN(n) || n < 0) {
        return 0;
    }

    return n;
}


/* =====================================================
   DIFFICULTY
===================================================== */

function getDifficulty() {

    return {
        nhận_biết: Number($("nb").value) || 0,
        thông_hiểu: Number($("th").value) || 0,
        vận_dụng: Number($("vd").value) || 0,
        vận_dụng_cao: Number($("vdc").value) || 0
    };
}


function updateDifficultyTotal() {

    const d = getDifficulty();

    const total =
        d.nhận_biết +
        d.thông_hiểu +
        d.vận_dụng +
        d.vận_dụng_cao;

    const element = $("difficultyTotal");

    element.textContent = `Tổng: ${total}%`;

    element.classList.remove(
        "valid",
        "invalid"
    );

    if (total === 100) {

        element.classList.add("valid");

    } else {

        element.classList.add("invalid");

    }
}


/* =====================================================
   DEFAULT PROMPT
===================================================== */

async function loadDefaultPrompt() {

    try {

        updatePromptStatus(
            "Đang tải default-prompt.txt..."
        );

        const response = await fetch(
            "default-prompt.txt",
            {
                cache: "no-cache"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Không tìm thấy default-prompt.txt"
            );
        }

        const text = await response.text();

        if (!text.trim()) {
            throw new Error(
                "default-prompt.txt đang rỗng"
            );
        }

        state.promptTemplate = text;
        state.promptTemplateSource =
            "default-prompt.txt";

        $("promptTemplate").value = text;

        updateTemplateStatus(
            "Đã tải prompt mặc định: default-prompt.txt"
        );

        updatePromptStatus(
            "Đã tải prompt mẫu"
        );

    } catch (error) {

        console.warn(
            "Không thể tự động tải default-prompt.txt:",
            error
        );

        updateTemplateStatus(
            "Chưa tải được prompt mặc định. Bạn có thể tải file hoặc dán prompt."
        );

        updatePromptStatus(
            "Có thể nhập prompt mẫu"
        );

    }
}


/* =====================================================
   PROMPT FILE
===================================================== */

async function handlePromptFile(event) {

    const file = event.target.files[0];

    if (!file) return;

    try {

        const text = await readTextFile(file);

        if (!text.trim()) {

            throw new Error(
                "File prompt đang rỗng."
            );
        }

        state.promptTemplate = text;

        state.promptTemplateSource =
            file.name;

        $("promptTemplate").value = text;

        updateTemplateStatus(
            `Đã tải prompt: ${file.name}`
        );

    } catch (error) {

        showError(
            "Không thể đọc file prompt: " +
            error.message
        );

    }

}


/* =====================================================
   PROMPT TEXTAREA
===================================================== */

$("promptTemplate").addEventListener(
    "input",
    function () {

        state.promptTemplate =
            this.value;

        state.promptTemplateSource =
            "Nội dung giáo viên nhập";

        updateTemplateStatus(
            "Prompt mẫu đã được chỉnh sửa"
        );

    }
);


/* =====================================================
   CLEAR PROMPT
===================================================== */

function clearPromptTemplate() {

    state.promptTemplate = "";
    state.promptTemplateSource = "";

    $("promptTemplate").value = "";

    updateTemplateStatus(
        "Đã xóa prompt mẫu"
    );

}


/* =====================================================
   SOURCE FILES
===================================================== */

async function handleSourceFiles(event) {

    const files = Array.from(
        event.target.files || []
    );

    for (const file of files) {

        try {

            const item = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                text: ""
            };

            /*
            Đọc trực tiếp các file văn bản.
            PDF/DOCX/XLSX sẽ được xử lý bằng
            thư viện ở phiên bản nâng cấp.
            */

            if (
                file.name.toLowerCase().endsWith(".txt") ||
                file.name.toLowerCase().endsWith(".md")
            ) {

                item.text =
                    await readTextFile(file);

            } else {

                item.text =
                    `[File ${file.name} chưa được trích xuất nội dung tự động. Giáo viên có thể bổ sung nội dung thủ công.]`;

            }

            state.files.push(item);

        } catch (error) {

            console.error(error);

            state.files.push({
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                text:
                    `[Không thể đọc file ${file.name}]`
            });

        }

    }

    renderFileList();

    event.target.value = "";
}


/* =====================================================
   READ TEXT FILE
===================================================== */

function readTextFile(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                resolve(
                    String(reader.result || "")
                );

            };

            reader.onerror = () => {

                reject(
                    new Error(
                        "Không thể đọc file."
                    )
                );

            };

            reader.readAsText(file);

        }
    );
}


/* =====================================================
   FILE LIST
===================================================== */

function renderFileList() {

    const container = $("fileList");

    container.innerHTML = "";

    if (state.files.length === 0) {

        return;
    }


    state.files.forEach(
        (item, index) => {

            const div =
                document.createElement("div");

            div.className = "file-item";

            const name =
                document.createElement("span");

            name.className = "file-name";

            name.textContent =
                `${item.name} (${formatFileSize(item.size)})`;


            const remove =
                document.createElement("button");

            remove.className =
                "remove-file";

            remove.type = "button";

            remove.textContent = "Xóa";

            remove.addEventListener(
                "click",
                () => {

                    state.files.splice(
                        index,
                        1
                    );

                    renderFileList();

                }
            );


            div.appendChild(name);
            div.appendChild(remove);

            container.appendChild(div);

        }
    );
}


function formatFileSize(bytes) {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


/* =====================================================
   BUILD FILE CONTEXT
===================================================== */

function buildDocumentContext() {

    if (state.files.length === 0) {

        return "Không có tài liệu nguồn được tải lên.";

    }

    let output = "";

    state.files.forEach(
        (item, index) => {

            output += `
===== BẮT ĐẦU TÀI LIỆU ${index + 1}: ${item.name} =====

${item.text || "(Không có nội dung văn bản được trích xuất.)"}

===== KẾT THÚC TÀI LIỆU ${index + 1}: ${item.name} =====

`;

        }
    );

    return output.trim();
}


/* =====================================================
   BUILD QUESTION TYPE TEXT
===================================================== */

function buildQuestionTypeText(config) {

    if (config.types.length === 0) {

        return "Chưa chọn dạng câu hỏi.";

    }

    let text = "";

    config.types.forEach(item => {

        text +=
            `- ${item.name}: ${item.count} câu\n`;

        if (item.type === "true_false") {

            text +=
                "  Mỗi câu gồm đúng 4 mệnh đề chung một ngữ cảnh.\n";

            text +=
                "  Ba mệnh đề đầu có tính chất dẫn dắt/gợi ý cho mệnh đề thứ tư.\n";

            text +=
                "  Không được để ba mệnh đề đầu tiết lộ trực tiếp đáp án mệnh đề thứ tư.\n";
        }

        if (item.type === "short_answer") {

            text +=
                "  Câu hỏi phải có đáp số duy nhất.\n";

            text +=
                "  Đáp án phải là số hoặc giá trị ngắn.\n";
        }

    });

    return text.trim();
}


/* =====================================================
   BUILD DIFFICULTY TEXT
===================================================== */

function buildDifficultyText() {

    const d = getDifficulty();

    return `
- Nhận biết: ${d.nhận_biết}%
- Thông hiểu: ${d.thông_hiểu}%
- Vận dụng: ${d.vận_dụng}%
- Vận dụng cao: ${d.vận_dụng_cao}%
`.trim();

}


/* =====================================================
   BUILD TRUE/FALSE REQUIREMENTS
===================================================== */

function buildTrueFalseRequirements() {

    if (!$("enableTF").checked) {

        return "";
    }

    const guided =
        $("tfGuided").checked;

    let text = `
===== QUY TẮC CÂU ĐÚNG / SAI =====

- Mỗi câu Đúng/Sai gồm đúng 4 mệnh đề.
- Bốn mệnh đề phải cùng dựa trên một ngữ cảnh chung.
- Mỗi mệnh đề phải có thể xác định khách quan là Đúng hoặc Sai.
- Không dùng mẹo ngôn ngữ để tạo mệnh đề sai.
- Không tạo 4 mệnh đề hoàn toàn độc lập.
`;

    if (guided) {

        text += `
- Ba mệnh đề đầu phải cung cấp dữ kiện, quan hệ hoặc kết quả trung gian để hỗ trợ quá trình suy luận.
- Mệnh đề thứ tư thường có mức độ tổng hợp/suy luận cao hơn.
- Ba mệnh đề đầu không được tiết lộ trực tiếp đáp án của mệnh đề thứ tư.
- Mệnh đề thứ tư không được chỉ là việc lặp lại một mệnh đề trước đó.
`;

    }

    text += `
- Phân bố Đúng/Sai giữa các mệnh đề phải đa dạng.
- Không tạo quy luật dễ đoán.
`.trim();

    return text;
}


/* =====================================================
   BUILD SHORT ANSWER REQUIREMENTS
===================================================== */

function buildShortAnswerRequirements() {

    if (!$("enableShort").checked) {

        return "";
    }

    let text = `
===== QUY TẮC CÂU TRẢ LỜI NGẮN =====

- Mỗi câu phải có một đáp số duy nhất.
- Đáp án cuối cùng phải là số hoặc giá trị ngắn.
- Không tạo câu hỏi có nhiều đáp số hợp lệ.
- Phải kiểm tra lại phép tính.
`;

    if ($("shortUnique").checked) {

        text +=
            "- Đáp án phải xác định duy nhất.\n";

    }

    if ($("shortUnit").checked) {

        text +=
            "- Nếu đại lượng có đơn vị, phải xác định rõ đơn vị.\n";

    }

    const rounding =
        $("rounding").value.trim();

    if (rounding) {

        text +=
            `- ${rounding}\n`;

    }

    return text.trim();
}


/* =====================================================
   TEMPLATE VARIABLES
===================================================== */

function getTemplateVariables() {

    const config =
        getQuestionConfiguration();

    const subject =
        getSubject();

    const total =
        config.total;

    const documentContext =
        buildDocumentContext();


    const teacherRequirements =
        $("teacherRequirements")
            .value
            .trim();


    const maTran =
        buildMatrixPlaceholder();


    return {

        "[MON]":
            subject,

        "[MÔN]":
            subject,

        "[LOP]":
            $("grade").value.trim(),

        "[LỚP]":
            $("grade").value.trim(),

        "[CHU_DE]":
            $("topic").value.trim(),

        "[CHỦ_ĐỀ]":
            $("topic").value.trim(),

        "[MUC_DICH]":
            $("purpose").value,

        "[MỤC_ĐÍCH]":
            $("purpose").value,

        "[SO_CAU]":
            String(total),

        "[SỐ_CÂU]":
            String(total),

        "[SO_LUONG_CAU]":
            String(total),

        "[DANG_CAU_HOI]":
            buildQuestionTypeText(config),

        "[PHAN_BO_MUC_DO]":
            buildDifficultyText(),

        "[YEU_CAU_GV]":
            teacherRequirements,

        "[YÊU_CẦU_GV]":
            teacherRequirements,

        "[NOI_DUNG]":
            documentContext,

        "[TÀI_LIỆU_NGUỒN]":
            documentContext,

        "[MA_TRAN]":
            maTran,

        "[ĐÚNG_SAI_YÊU_CẦU]":
            buildTrueFalseRequirements(),

        "[TRA_LOI_NGAN_YEU_CAU]":
            buildShortAnswerRequirements(),

        "[THONG_KE_FILE]":
            buildFileStatistics()

    };
}


/* =====================================================
   REPLACE TEMPLATE VARIABLES
===================================================== */

function replaceTemplateVariables(
    template,
    variables
) {

    let result = template;

    Object.entries(variables)
        .forEach(
            ([key, value]) => {

                result =
                    result.split(key)
                        .join(value ?? "");

            }
        );

    return result;
}


/* =====================================================
   MATRIX PLACEHOLDER
===================================================== */

function buildMatrixPlaceholder() {

    const config =
        getQuestionConfiguration();

    let text = "";

    text += "Dạng câu hỏi và số lượng:\n";

    config.types.forEach(item => {

        text +=
            `- ${item.name}: ${item.count} câu\n`;

    });

    text += "\nPhân bố mức độ:\n";

    text +=
        buildDifficultyText();

    text += `

Lưu ý:
- Câu Đúng/Sai gồm 4 mệnh đề/câu.
- Mỗi mệnh đề cần được phân loại mức độ phù hợp.
- Câu trả lời ngắn phải có đáp số duy nhất.
`;

    return text.trim();
}


/* =====================================================
   FILE STATISTICS
===================================================== */

function buildFileStatistics() {

    if (state.files.length === 0) {

        return "0 file";

    }

    const totalSize =
        state.files.reduce(
            (sum, item) =>
                sum + item.size,
            0
        );

    return `
Số file: ${state.files.length}
Tổng dung lượng: ${formatFileSize(totalSize)}
Tên file:
${state.files.map(
    item => `- ${item.name}`
).join("\n")}
`.trim();

}


/* =====================================================
   GENERATE PROMPT
===================================================== */

function generatePrompt() {

    clearError();

    try {

        validateForm();

        let template =
            $("promptTemplate")
                .value
                .trim();


        if (!template) {

            throw new Error(
                "Chưa có prompt mẫu. Hãy tải default-prompt.txt hoặc dán prompt mẫu."
            );

        }


        state.promptTemplate =
            template;


        const variables =
            getTemplateVariables();


        let prompt =
            replaceTemplateVariables(
                template,
                variables
            );


        /*
        Nếu prompt mẫu không có các biến quan trọng,
        bổ sung phần cấu hình tự động ở cuối.
        */

        prompt =
            appendDynamicRequirements(
                prompt
            );


        state.generatedPrompt =
            prompt;


        $("generatedPrompt").value =
            prompt;


        $("promptLength").textContent =
            `${prompt.length.toLocaleString("vi-VN")} ký tự`;


        $("copyPrompt").disabled =
            false;

        $("downloadPrompt").disabled =
            false;


        $("copyStatus").textContent =
            "Đã tạo prompt thành công.";

        $("promptStatus").textContent =
            "Prompt đã sẵn sàng";


    } catch (error) {

        showError(
            error.message
        );

    }

}


/* =====================================================
   APPEND DYNAMIC REQUIREMENTS
===================================================== */

function appendDynamicRequirements(prompt) {

    const config =
        getQuestionConfiguration();

    let block = `

=========================================================
THÔNG TIN ĐỘNG TỪ ỨNG DỤNG
=========================================================

MÔN:
${getSubject()}

LỚP:
${$("grade").value.trim()}

CHỦ ĐỀ:
${$("topic").value.trim()}

MỤC ĐÍCH:
${$("purpose").value}

TỔNG SỐ CÂU:
${config.total}

DẠNG CÂU:
${buildQuestionTypeText(config)}

PHÂN BỐ MỨC ĐỘ:
${buildDifficultyText()}
`;


    if ($("enableTF").checked) {

        block += `

${buildTrueFalseRequirements()}
`;

    }


    if ($("enableShort").checked) {

        block += `

${buildShortAnswerRequirements()}
`;

    }


    block += `

YÊU CẦU GIÁO VIÊN:
${$("teacherRequirements").value.trim() || "Không có yêu cầu riêng."}

TÀI LIỆU:
${buildDocumentContext()}

=========================================================
KẾT THÚC THÔNG TIN ĐỘNG
=========================================================
`;

    return prompt + block;
}


/* =====================================================
   VALIDATION
===================================================== */

function validateForm() {

    const subject =
        getSubject();

    if (!subject) {

        throw new Error(
            "Vui lòng chọn hoặc nhập môn học."
        );

    }


    if (!$("grade").value.trim()) {

        throw new Error(
            "Vui lòng nhập lớp."
        );

    }


    if (!$("topic").value.trim()) {

        throw new Error(
            "Vui lòng nhập bài/chủ đề."
        );

    }


    const config =
        getQuestionConfiguration();

    if (config.types.length === 0) {

        throw new Error(
            "Vui lòng chọn ít nhất một dạng câu hỏi."
        );

    }


    if (config.total <= 0) {

        throw new Error(
            "Tổng số câu hỏi phải lớn hơn 0."
        );

    }


    const d =
        getDifficulty();

    const total =
        d.nhận_biết +
        d.thông_hiểu +
        d.vận_dụng +
        d.vận_dụng_cao;


    if (total !== 100) {

        throw new Error(
            `Tỷ lệ mức độ hiện tại là ${total}%. Tổng phải bằng 100%.`
        );

    }

}


/* =====================================================
   COPY PROMPT
===================================================== */

async function copyGeneratedPrompt() {

    const prompt =
        $("generatedPrompt").value;

    if (!prompt) return;

    try {

        await navigator.clipboard.writeText(
            prompt
        );

        $("copyStatus").textContent =
            "Đã sao chép prompt.";

    } catch (error) {

        $("generatedPrompt").select();

        document.execCommand("copy");

        $("copyStatus").textContent =
            "Đã sao chép prompt.";

    }

}


/* =====================================================
   DOWNLOAD PROMPT
===================================================== */

function downloadPrompt() {

    const prompt =
        $("generatedPrompt").value;

    if (!prompt) return;

    const blob =
        new Blob(
            [prompt],
            {
                type: "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "prompt-phieu-bai-tap.txt";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

}


/* =====================================================
   SAMPLE DATA
===================================================== */

function loadSampleData() {

    $("subject").value = "Toán";

    $("customSubjectGroup")
        .classList.add("hidden");

    $("grade").value = "10";

    $("topic").value =
        "Hàm số bậc hai";

    $("purpose").value =
        "Luyện tập";


    $("enableMCQ").checked =
        true;

    $("enableTF").checked =
        true;

    $("enableShort").checked =
        true;


    $("mcqCount").value =
        6;

    $("tfCount").value =
        2;

    $("shortCount").value =
        2;


    $("nb").value =
        20;

    $("th").value =
        30;

    $("vd").value =
        30;

    $("vdc").value =
        20;


    $("teacherRequirements").value =
`- Phù hợp học sinh trung bình.
- Bám sát kiến thức bài học.
- Không sử dụng kiến thức ngoài phạm vi.
- Câu Đúng/Sai phải có 4 mệnh đề chung một ngữ cảnh.
- Ba mệnh đề đầu tạo nền tảng cho mệnh đề thứ tư nhưng không được lộ đáp án.
- Câu trả lời ngắn phải có đáp số duy nhất.
- Kiểm tra kỹ các phép tính.`;


    updateQuestionTypeUI();

    updateDifficultyTotal();

}


/* =====================================================
   RESET
===================================================== */

function resetForm() {

    if (
        !confirm(
            "Bạn có chắc muốn đặt lại biểu mẫu?"
        )
    ) {

        return;

    }


    $("subject").value = "";

    $("customSubject").value = "";

    $("grade").value = "";

    $("topic").value = "";

    $("purpose").value =
        "Luyện tập";


    $("enableMCQ").checked =
        true;

    $("enableTF").checked =
        false;

    $("enableShort").checked =
        false;


    $("mcqCount").value =
        10;

    $("tfCount").value =
        2;

    $("shortCount").value =
        2;


    $("nb").value =
        25;

    $("th").value =
        30;

    $("vd").value =
        30;

    $("vdc").value =
        15;


    $("teacherRequirements").value =
        "";


    state.files = [];

    renderFileList();

    $("generatedPrompt").value =
        "";

    $("promptLength").textContent =
        "0 ký tự";

    $("copyPrompt").disabled =
        true;

    $("downloadPrompt").disabled =
        true;


    clearError();

    updateQuestionTypeUI();

    updateDifficultyTotal();

}


/* =====================================================
   API PANEL
===================================================== */

function toggleApiPanel() {

    const panel =
        $("apiPanel");

    const hidden =
        panel.classList.contains(
            "hidden"
        );


    if (hidden) {

        panel.classList.remove(
            "hidden"
        );

        $("toggleApi").textContent =
            "Đóng";

    } else {

        panel.classList.add(
            "hidden"
        );

        $("toggleApi").textContent =
            "Mở";

    }

}


/* =====================================================
   API CONNECTION
===================================================== */

async function testApiConnection() {

    const key =
        $("apiKey").value.trim();

    const provider =
        $("provider").value;


    if (!key) {

        setApiStatus(
            "Vui lòng nhập API key.",
            true
        );

        return;

    }


    /*
    Chưa thực hiện gọi API thật trong phiên bản cơ sở.

    Không giả lập rằng API đã kết nối thành công.
    */

    setApiStatus(
        `Đã nhận API key cho ${provider}, nhưng chức năng kiểm tra API thực tế cần được cấu hình provider tương ứng.`,
        false
    );

}


/* =====================================================
   DIRECT GENERATION
===================================================== */

async function generateDirectWorksheet() {

    const key =
        $("apiKey").value.trim();

    if (!key) {

        setApiStatus(
            "Chưa nhập API key. Bạn vẫn có thể dùng chức năng TẠO PROMPT.",
            true
        );

        return;

    }


    /*
    Quan trọng:

    Không gọi API giả.

    Phiên bản này chỉ chuẩn bị kiến trúc.
    Provider thật sẽ được triển khai riêng.
    */

    setApiStatus(
        "Chức năng API trực tiếp chưa được cấu hình provider thật. Hãy dùng TẠO PROMPT hoặc tích hợp API provider ở bước tiếp theo.",
        true
    );

}


/* =====================================================
   API STATUS
===================================================== */

function setApiStatus(
    message,
    isError
) {

    const element =
        $("apiStatus");

    element.textContent =
        message;

    element.style.color =
        isError
            ? "var(--danger)"
            : "var(--success)";

}


/* =====================================================
   RENDER AI RESULT
===================================================== */

function renderWorksheet(data) {

    state.resultData =
        data;

    const container =
        $("worksheet");

    container.innerHTML = "";

    if (!data || !Array.isArray(data.questions)) {

        container.textContent =
            "Không có dữ liệu câu hỏi.";

        return;

    }


    const title =
        document.createElement("div");

    title.className =
        "worksheet-title";

    title.innerHTML = `
        <h2>${escapeHTML(data.title || "PHIẾU BÀI TẬP")}</h2>
        <div class="teacher-info">
            ${escapeHTML(data.subject || "")}
            ${data.grade ? " – Lớp " + escapeHTML(data.grade) : ""}
        </div>
    `;

    container.appendChild(title);


    data.questions.forEach(
        (question, index) => {

            const div =
                document.createElement("div");

            div.className =
                "worksheet-question";

            div.innerHTML =
                renderQuestion(
                    question,
                    index + 1
                );

            container.appendChild(div);

        }
    );


    $("resultCard")
        .classList.remove("hidden");

}


/* =====================================================
   RENDER QUESTION
===================================================== */

function renderQuestion(
    q,
    number
) {

    if (
        q.type ===
        "multiple_choice"
    ) {

        return renderMCQ(
            q,
            number
        );

    }


    if (
        q.type ===
        "true_false"
    ) {

        return renderTrueFalse(
            q,
            number
        );

    }


    if (
        q.type ===
        "short_answer"
    ) {

        return renderShortAnswer(
            q,
            number
        );

    }


    return `
        <div>
            <strong>Câu ${number}.</strong>
            ${escapeHTML(
                q.question || ""
            )}
        </div>
    `;
}


/* =====================================================
   MCQ
===================================================== */

function renderMCQ(
    q,
    number
) {

    const options =
        q.options || {};

    let html = `
        <div>
            <strong>Câu ${number}.</strong>
            ${escapeHTML(
                q.question || ""
            )}
        </div>
    `;


    ["A", "B", "C", "D"]
        .forEach(letter => {

            html += `
                <div class="option">
                    ${letter}. 
                    ${escapeHTML(
                        options[letter] || ""
                    )}
                </div>
            `;

        });


    if (state.showAnswers) {

        html += `
            <div class="answer-section">
                <strong>Đáp án:</strong>
                ${escapeHTML(
                    q.answer || ""
                )}

                ${
                    q.explanation
                    ? `
                        <p>
                            <strong>Giải thích:</strong>
                            ${escapeHTML(
                                q.explanation
                            )}
                        </p>
                    `
                    : ""
                }
            </div>
        `;

    }

    return html;
}


/* =====================================================
   TRUE / FALSE
===================================================== */

function renderTrueFalse(
    q,
    number
) {

    let html = `
        <div>
            <strong>Câu ${number}.</strong>
        </div>
    `;


    if (q.context) {

        html += `
            <p>
                ${escapeHTML(
                    q.context
                )}
            </p>
        `;

    }


    const statements =
        Array.isArray(q.statements)
            ? q.statements
            : [];


    statements.forEach(
        statement => {

            html += `
                <div class="tf-statement">

                    <strong>
                        ${escapeHTML(
                            statement.id || ""
                        )})
                    </strong>

                    ${escapeHTML(
                        statement.text || ""
                    )}

                    ${
                        state.showAnswers
                        ? `
                            <div>
                                <strong>
                                    Đáp án:
                                </strong>

                                ${
                                    statement.answer
                                        ? "Đúng"
                                        : "Sai"
                                }
                            </div>

                            ${
                                statement.explanation
                                ? `
                                    <small>
                                        ${escapeHTML(
                                            statement.explanation
                                        )}
                                    </small>
                                `
                                : ""
                            }
                        `
                        : `
                            <div>
                                ☐ Đúng
                                &nbsp;&nbsp;
                                ☐ Sai
                            </div>
                        `
                    }

                </div>
            `;

        }
    );


    return html;
}


/* =====================================================
   SHORT ANSWER
===================================================== */

function renderShortAnswer(
    q,
    number
) {

    let html = `
        <div>
            <strong>Câu ${number}.</strong>
            ${escapeHTML(
                q.question || ""
            )}
        </div>

        <div style="margin-top:10px">
            Đáp án: ____________________
        </div>
    `;


    if (state.showAnswers) {

        html += `
            <div class="answer-section">

                <strong>Đáp số:</strong>

                ${escapeHTML(
                    q.answer || ""
                )}

                ${
                    q.unit
                    ? " " +
                      escapeHTML(q.unit)
                    : ""
                }

                ${
                    q.explanation
                    ? `
                        <p>
                            <strong>
                                Giải thích:
                            </strong>
                            ${escapeHTML(
                                q.explanation
                            )}
                        </p>
                    `
                    : ""
                }

            </div>
        `;

    }

    return html;
}


/* =====================================================
   TOGGLE ANSWERS
===================================================== */

function toggleAnswers() {

    state.showAnswers =
        !state.showAnswers;

    $("showAnswer").textContent =
        state.showAnswers
            ? "Ẩn đáp án"
            : "Xem đáp án";


    if (state.resultData) {

        renderWorksheet(
            state.resultData
        );

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   UI STATUS
===================================================== */

function updateTemplateStatus(
    message
) {

    $("templateStatus")
        .textContent = message;

}


function updatePromptStatus(
    message
) {

    $("promptStatus")
        .textContent = message;

}


/* =====================================================
   ERROR
===================================================== */

function showError(message) {

    const box =
        $("errorBox");

    box.textContent =
        message;

    box.classList.remove(
        "hidden"
    );

    box.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function clearError() {

    $("errorBox")
        .classList.add(
            "hidden"
        );

    $("errorBox")
        .textContent = "";

}