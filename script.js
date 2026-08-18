/* =========================================================
   PROMPT BUILDER
   script.js

   Chức năng:
   1. Đọc default-prompt.txt
   2. Quản lý prompt mẫu
   3. Thu thập thông tin giáo viên
   4. Tạo prompt hoàn chỉnh
   5. Copy prompt
   6. Khối nâng cao
   7. Quản lý tài liệu nguồn
   8. Gửi AI API nếu người dùng có API Key
   ========================================================= */


/* =========================================================
   1. GLOBAL STATE
========================================================= */

const AppState = {

    defaultPrompt: "",

    promptSource: "default-prompt.txt",

    sourceFiles: [],

    aiGenerating: false

};


/* =========================================================
   2. DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   3. INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});


async function initializeApp() {

    bindEvents();

    updateQuestionTypeStates();

    updateLevels();

    await loadDefaultPrompt();

}


/* =========================================================
   4. EVENT BINDINGS
========================================================= */

function bindEvents() {


    /* ---------------------------------------------
       Question types
    --------------------------------------------- */

    $("enableMCQ").addEventListener(
        "change",
        updateQuestionTypeStates
    );

    $("enableTF").addEventListener(
        "change",
        updateQuestionTypeStates
    );

    $("enableShort").addEventListener(
        "change",
        updateQuestionTypeStates
    );


    /* ---------------------------------------------
       Level checkboxes
    --------------------------------------------- */

    [
        "levelRecognize",
        "levelUnderstand",
        "levelApply",
        "levelAdvanced"
    ].forEach(id => {

        $(id).addEventListener(
            "change",
            updateLevels
        );

    });


    /* ---------------------------------------------
       Prompt file
    --------------------------------------------- */

    $("promptFile").addEventListener(
        "change",
        handlePromptFile
    );


    /* ---------------------------------------------
       Reset prompt
    --------------------------------------------- */

    $("resetPromptBtn").addEventListener(
        "click",
        resetDefaultPrompt
    );


    /* ---------------------------------------------
       Generate prompt
    --------------------------------------------- */

    $("generatePromptBtn").addEventListener(
        "click",
        generatePrompt
    );


    /* ---------------------------------------------
       Copy prompt
    --------------------------------------------- */

    $("copyPromptBtn").addEventListener(
        "click",
        copyGeneratedPrompt
    );

    $("copyResultBtn").addEventListener(
        "click",
        copyGeneratedPrompt
    );


    /* ---------------------------------------------
       Clear result
    --------------------------------------------- */

    $("clearResultBtn").addEventListener(
        "click",
        clearGeneratedPrompt
    );


    /* ---------------------------------------------
       Advanced section
    --------------------------------------------- */

    $("advancedToggle").addEventListener(
        "click",
        toggleAdvanced
    );


    /* ---------------------------------------------
       Source files
    --------------------------------------------- */

    $("sourceFiles").addEventListener(
        "change",
        handleSourceFiles
    );


    /* ---------------------------------------------
       AI
    --------------------------------------------- */

    $("generateAIButton").addEventListener(
        "click",
        generateWithAI
    );


    /* ---------------------------------------------
       Copy AI result
    --------------------------------------------- */

    $("copyAIResultBtn").addEventListener(
        "click",
        copyAIResult
    );


    /* ---------------------------------------------
       Provider change
    --------------------------------------------- */

    $("aiProvider").addEventListener(
        "change",
        updateProviderDefaults
    );

}


/* =========================================================
   5. LOAD DEFAULT PROMPT
========================================================= */

async function loadDefaultPrompt() {

    setStatus(
        "Đang tải prompt mẫu...",
        "loading"
    );


    /*
       Quan trọng với GitHub Pages:

       Dùng URL tương đối dựa trên vị trí
       thực tế của index.html.
    */

    try {

        const url = new URL(
            "default-prompt.txt",
            window.location.href
        );


        const response = await fetch(
            url.toString(),
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} – không tìm thấy file`
            );

        }


        const text = await response.text();


        if (!text.trim()) {

            throw new Error(
                "default-prompt.txt đang rỗng"
            );

        }


        AppState.defaultPrompt = text;


        $("promptTemplate").value = text;


        AppState.promptSource =
            "default-prompt.txt";


        $("promptFileName").textContent =
            "Nguồn: default-prompt.txt";


        setStatus(
            "Đã tải prompt mẫu",
            "success"
        );


    } catch (error) {

        console.error(
            "Lỗi đọc default-prompt.txt:",
            error
        );


        $("promptTemplate").value = "";


        $("promptFileName").textContent =
            "Không đọc được default-prompt.txt";


        setStatus(
            "Không đọc được prompt mẫu",
            "error"
        );


        showToast(
            "Không đọc được default-prompt.txt"
        );

    }

}


/* =========================================================
   6. STATUS
========================================================= */

function setStatus(message, type = "") {

    const element = $("promptStatus");

    element.textContent = message;

    element.className =
        "status-badge";

    if (type) {

        element.classList.add(type);

    }

}


/* =========================================================
   7. PROMPT FILE
========================================================= */

async function handlePromptFile(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    try {

        const text =
            await file.text();


        if (!text.trim()) {

            throw new Error(
                "File prompt rỗng."
            );

        }


        $("promptTemplate").value =
            text;


        AppState.promptSource =
            file.name;


        $("promptFileName").textContent =
            `Nguồn: ${file.name}`;


        setStatus(
            "Đã tải prompt riêng",
            "success"
        );


        showToast(
            "Đã tải prompt riêng"
        );


    } catch (error) {

        console.error(error);


        alert(
            "Không thể đọc file prompt."
        );

    }

}


/* =========================================================
   8. RESET DEFAULT PROMPT
========================================================= */

function resetDefaultPrompt() {

    if (!AppState.defaultPrompt) {

        showToast(
            "Chưa có prompt mặc định."
        );

        return;

    }


    $("promptTemplate").value =
        AppState.defaultPrompt;


    AppState.promptSource =
        "default-prompt.txt";


    $("promptFileName").textContent =
        "Nguồn: default-prompt.txt";


    setStatus(
        "Đã khôi phục prompt mặc định",
        "success"
    );


    showToast(
        "Đã khôi phục prompt mặc định"
    );

}


/* =========================================================
   9. QUESTION TYPE STATE
========================================================= */

function updateQuestionTypeStates() {

    updateQuestionType(
        "enableMCQ",
        "mcqOptions"
    );

    updateQuestionType(
        "enableTF",
        "tfOptions"
    );

    updateQuestionType(
        "enableShort",
        "shortOptions"
    );

}


function updateQuestionType(
    checkboxId,
    optionsId
) {

    const checkbox =
        $(checkboxId);

    const options =
        $(optionsId);

    const container =
        checkbox.closest(
            ".question-type"
        );


    if (checkbox.checked) {

        options.style.opacity = "1";

        container.classList.remove(
            "disabled"
        );

    } else {

        options.style.opacity = "0.45";

        container.classList.add(
            "disabled"
        );

    }

}


/* =========================================================
   10. LEVELS
========================================================= */

function updateLevels() {

    const levels = [];


    if ($("levelRecognize").checked) {

        levels.push(
            "Nhận biết"
        );

    }


    if ($("levelUnderstand").checked) {

        levels.push(
            "Thông hiểu"
        );

    }


    if ($("levelApply").checked) {

        levels.push(
            "Vận dụng"
        );

    }


    if ($("levelAdvanced").checked) {

        levels.push(
            "Vận dụng cao"
        );

    }


    return levels;

}


/* =========================================================
   11. COLLECT BASIC DATA
========================================================= */

function collectBasicData() {

    return {

        subject:
            $("subject").value.trim(),

        grade:
            $("grade").value.trim(),

        topic:
            $("topic").value.trim(),

        studentLevel:
            $("studentLevel").value,

        purpose:
            $("purpose").value,

        customRequirements:
            $("customRequirements").value.trim(),

        levels:
            updateLevels(),

        mcq: {

            enabled:
                $("enableMCQ").checked,

            count:
                Number(
                    $("mcqCount").value
                ) || 0

        },

        trueFalse: {

            enabled:
                $("enableTF").checked,

            count:
                Number(
                    $("tfCount").value
                ) || 0

        },

        shortAnswer: {

            enabled:
                $("enableShort").checked,

            count:
                Number(
                    $("shortCount").value
                ) || 0

        }

    };

}


/* =========================================================
   12. VALIDATE BASIC DATA
========================================================= */

function validateBasicData(data) {

    const errors = [];


    if (!data.subject) {

        errors.push(
            "Chưa nhập môn học."
        );

    }


    if (!data.grade) {

        errors.push(
            "Chưa nhập lớp."
        );

    }


    if (!data.topic) {

        errors.push(
            "Chưa nhập chủ đề / bài học."
        );

    }


    const totalQuestions =

        (data.mcq.enabled
            ? data.mcq.count
            : 0)

        +

        (data.trueFalse.enabled
            ? data.trueFalse.count
            : 0)

        +

        (data.shortAnswer.enabled
            ? data.shortAnswer.count
            : 0);


    if (totalQuestions <= 0) {

        errors.push(
            "Cần chọn ít nhất một dạng câu hỏi và số câu lớn hơn 0."
        );

    }


    if (
        data.trueFalse.enabled &&
        data.trueFalse.count > 0
    ) {

        /*
           Đúng/Sai luôn được hiểu là:
           1 ngữ cảnh + 4 mệnh đề.
        */

    }


    return errors;

}


/* =========================================================
   13. BUILD QUESTION STRUCTURE
========================================================= */

function buildQuestionStructure(data) {

    const lines = [];


    if (data.mcq.enabled) {

        lines.push(
            `- Trắc nghiệm 4 lựa chọn: ${data.mcq.count} câu`
        );

    }


    if (data.trueFalse.enabled) {

        lines.push(
            `- Đúng/Sai: ${data.trueFalse.count} câu`
        );

        lines.push(
            "  + Mỗi câu có 1 ngữ cảnh chung và 4 mệnh đề a, b, c, d."
        );

        lines.push(
            "  + Mặc định 3 mệnh đề đầu có vai trò gợi ý/dẫn dắt."
        );

        lines.push(
            "  + Mệnh đề d phải có giá trị đánh giá riêng, không được suy ra máy móc từ a, b, c."
        );

    }


    if (data.shortAnswer.enabled) {

        lines.push(
            `- Trả lời ngắn – đáp số: ${data.shortAnswer.count} câu`
        );

        lines.push(
            "  + Học sinh trả lời bằng số."
        );

        lines.push(
            "  + Phải cung cấp đáp án chính xác và lời giải."
        );

    }


    return lines.join("\n");

}


/* =========================================================
   14. BUILD PROMPT
========================================================= */

function buildPrompt(data) {

    const template =
        $("promptTemplate").value.trim();


    if (!template) {

        throw new Error(
            "Prompt mẫu đang trống."
        );

    }


    const questionStructure =
        buildQuestionStructure(data);


    const levelText =
        data.levels.length > 0
            ? data.levels.join(", ")
            : "Không chỉ định";


    /*
       Prompt mẫu được giữ nguyên.
       Phần thông tin giáo viên được thêm phía sau.
    */

    const prompt = `

${template}


============================================================
THÔNG TIN CẤU HÌNH CỦA GIÁO VIÊN
============================================================

Môn học:
${data.subject}

Lớp:
${data.grade}

Chủ đề / Bài học:
${data.topic}

Đối tượng học sinh:
${data.studentLevel || "Không chỉ định"}

Mục đích:
${data.purpose}

Mức độ nhận thức:
${levelText}


============================================================
CẤU TRÚC PHIẾU BÀI TẬP
============================================================

${questionStructure}


============================================================
YÊU CẦU RIÊNG CỦA GIÁO VIÊN
============================================================

${data.customRequirements || "Không có yêu cầu riêng."}


============================================================
QUY TẮC QUAN TRỌNG
============================================================

1. Bám sát chương trình và chủ đề được yêu cầu.

2. Không tự ý đưa kiến thức vượt quá phạm vi nếu giáo viên
   không yêu cầu.

3. Các câu hỏi phải có tính phân hóa phù hợp với đối tượng
   học sinh.

4. Với câu trắc nghiệm:
   - Có đúng 4 phương án A, B, C, D.
   - Chỉ có một đáp án đúng.
   - Các phương án nhiễu phải hợp lý.
   - Không để đáp án đúng nổi bật về hình thức.

5. Với câu Đúng/Sai:
   - Mỗi câu có một ngữ cảnh chung.
   - Có đúng 4 mệnh đề a, b, c, d.
   - Các mệnh đề phải liên quan đến cùng ngữ cảnh.
   - Mặc định a, b, c có vai trò gợi ý/dẫn dắt.
   - Không được để a, b, c vô tình tiết lộ trực tiếp đáp án d.
   - Phải xác định rõ Đúng hoặc Sai cho từng mệnh đề.

6. Với câu trả lời ngắn:
   - Đáp án cuối cùng phải là một giá trị số.
   - Nếu cần đơn vị thì ghi rõ đơn vị.
   - Không tạo câu hỏi có nhiều đáp án số khác nhau.
   - Phải có lời giải đủ để kiểm tra đáp án.

7. Sau khi tạo câu hỏi phải tự kiểm tra:
   - Tính chính xác.
   - Tính phù hợp chương trình.
   - Đáp án.
   - Lời giải.
   - Không trùng lặp.
   - Không mâu thuẫn giữa câu hỏi và đáp án.


============================================================
YÊU CẦU ĐẦU RA
============================================================

Hãy tạo phiếu bài tập hoàn chỉnh.

Sau phần phiếu bài tập, tạo riêng:

A. ĐÁP ÁN

B. LỜI GIẢI CHI TIẾT

C. BẢNG KIỂM TRA CHẤT LƯỢNG

Trong bảng kiểm tra chất lượng, hãy kiểm tra:
- Số lượng câu.
- Đúng cấu trúc.
- Đáp án chính xác.
- Không có câu hỏi mơ hồ.
- Không có phương án trùng nhau.
- Câu Đúng/Sai có đủ 4 mệnh đề.
- Câu trả lời ngắn có đáp số xác định.

Không giải thích về quá trình tạo câu hỏi.
Chỉ xuất ra kết quả theo đúng cấu trúc yêu cầu.
`.trim();


    return prompt;

}


/* =========================================================
   15. GENERATE PROMPT
========================================================= */

function generatePrompt() {

    try {

        const data =
            collectBasicData();


        const errors =
            validateBasicData(data);


        if (errors.length > 0) {

            alert(
                errors.join("\n")
            );

            return;

        }


        const prompt =
            buildPrompt(data);


        $("generatedPrompt").value =
            prompt;


        $("resultSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        showToast(
            "Đã tạo prompt hoàn chỉnh"
        );


    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


/* =========================================================
   16. COPY GENERATED PROMPT
========================================================= */

async function copyGeneratedPrompt() {

    const text =
        $("generatedPrompt").value.trim();


    if (!text) {

        showToast(
            "Chưa có prompt để sao chép."
        );

        return;

    }


    const success =
        await copyText(text);


    if (success) {

        showToast(
            "Đã sao chép prompt"
        );

    } else {

        alert(
            "Không thể sao chép tự động. Hãy chọn và copy thủ công."
        );

    }

}


/* =========================================================
   17. COPY AI RESULT
========================================================= */

async function copyAIResult() {

    const text =
        $("aiResult").innerText.trim();


    if (!text) {

        showToast(
            "Chưa có kết quả AI."
        );

        return;

    }


    const success =
        await copyText(text);


    if (success) {

        showToast(
            "Đã sao chép phiếu"
        );

    }

}


/* =========================================================
   18. COPY HELPER
========================================================= */

async function copyText(text) {

    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return true;

        }


        /*
           Fallback cho một số trình duyệt
        */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value = text;

        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        const success =
            document.execCommand(
                "copy"
            );


        document.body.removeChild(
            textarea
        );


        return success;

    } catch (error) {

        console.error(error);

        return false;

    }

}


/* =========================================================
   19. CLEAR RESULT
========================================================= */

function clearGeneratedPrompt() {

    $("generatedPrompt").value = "";

}


/* =========================================================
   20. ADVANCED TOGGLE
========================================================= */

function toggleAdvanced() {

    const content =
        $("advancedContent");

    const header =
        $("advancedToggle");


    const isHidden =
        content.classList.contains(
            "hidden"
        );


    if (isHidden) {

        content.classList.remove(
            "hidden"
        );

        header.classList.add(
            "open"
        );

        header.setAttribute(
            "aria-expanded",
            "true"
        );

    } else {

        content.classList.add(
            "hidden"
        );

        header.classList.remove(
            "open"
        );

        header.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   21. SOURCE FILES
========================================================= */

async function handleSourceFiles(event) {

    const files =
        Array.from(
            event.target.files
        );


    if (!files.length) {

        return;

    }


    for (const file of files) {

        await addSourceFile(file);

    }


    renderSourceFileList();

}


async function addSourceFile(file) {

    /*
       Không cho trùng tên file.
    */

    const exists =
        AppState.sourceFiles.some(
            item =>
                item.name === file.name
        );


    if (exists) {

        return;

    }


    const item = {

        file: file,

        name: file.name,

        type: file.type,

        size: file.size,

        text: null,

        supported: false

    };


    /*
       Hiện tại hỗ trợ trực tiếp TXT/MD.

       PDF/DOCX sẽ được bổ sung thư viện chuyên dụng
       ở phiên bản tiếp theo.
    */

    const extension =
        getFileExtension(
            file.name
        );


    if (
        extension === "txt" ||
        extension === "md"
    ) {

        try {

            item.text =
                await file.text();

            item.supported = true;

        } catch (error) {

            console.error(
                "Không đọc được file:",
                file.name,
                error
            );

        }

    }


    AppState.sourceFiles.push(
        item
    );

}


/* =========================================================
   22. FILE EXTENSION
========================================================= */

function getFileExtension(filename) {

    const parts =
        filename
            .toLowerCase()
            .split(".");


    return parts.length > 1
        ? parts.pop()
        : "";

}


/* =========================================================
   23. RENDER SOURCE FILES
========================================================= */

function renderSourceFileList() {

    const container =
        $("sourceFileList");


    container.innerHTML = "";


    if (
        AppState.sourceFiles.length === 0
    ) {

        container.textContent =
            "Chưa có tài liệu.";

        return;

    }


    AppState.sourceFiles.forEach(
        (item, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "file-item";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "file-item-name";


            name.textContent =
                `${item.name} – ${formatFileSize(item.size)}`;


            if (!item.supported) {

                name.textContent +=
                    " – chưa trích xuất văn bản";

            }


            const remove =
                document.createElement(
                    "button"
                );


            remove.type =
                "button";


            remove.className =
                "file-item-remove";


            remove.textContent =
                "✕";


            remove.title =
                "Xóa tài liệu";


            remove.addEventListener(
                "click",
                () => {

                    AppState.sourceFiles.splice(
                        index,
                        1
                    );

                    renderSourceFileList();

                }
            );


            row.appendChild(
                name
            );


            row.appendChild(
                remove
            );


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   24. FORMAT FILE SIZE
========================================================= */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }


    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}


/* =========================================================
   25. SOURCE MODE
========================================================= */

function getSourceMode() {

    const selected =
        document.querySelector(
            'input[name="sourceMode"]:checked'
        );


    return selected
        ? selected.value
        : "reference";

}


/* =========================================================
   26. BUILD SOURCE INSTRUCTION
========================================================= */

function buildSourceInstruction() {

    const mode =
        getSourceMode();


    if (mode === "strict") {

        return `
TÀI LIỆU NGUỒN – BÁM SÁT

Hãy ưu tiên tuyệt đối nội dung trong các tài liệu nguồn.
Các câu hỏi phải phù hợp với kiến thức được trình bày
trong tài liệu.

Không tự ý mở rộng sang nội dung không liên quan.
`.trim();

    }


    if (mode === "only") {

        return `
TÀI LIỆU NGUỒN – CHỈ SỬ DỤNG TÀI LIỆU

Chỉ sử dụng kiến thức có trong tài liệu nguồn được cung cấp.

Không sử dụng kiến thức bên ngoài tài liệu, trừ khi giáo viên
có yêu cầu rõ ràng.

Nếu tài liệu không đủ thông tin để tạo một câu hỏi,
không được tự bịa dữ kiện.
`.trim();

    }


    return `
TÀI LIỆU NGUỒN – THAM KHẢO

Sử dụng tài liệu nguồn như tài liệu tham khảo để hiểu nội dung,
thuật ngữ, kiến thức và phạm vi chủ đề.

Ưu tiên tính chính xác và phù hợp với tài liệu.
`.trim();

}


/* =========================================================
   27. BUILD SOURCE CONTENT
========================================================= */

function buildSourceContent() {

    const supportedFiles =
        AppState.sourceFiles.filter(
            item =>
                item.supported &&
                item.text
        );


    if (
        supportedFiles.length === 0
    ) {

        return "";

    }


    return supportedFiles
        .map(
            item => `

------------------------------
TÀI LIỆU: ${item.name}
------------------------------

${item.text}
`
        )
        .join("\n");

}


/* =========================================================
   28. BUILD AI PROMPT
========================================================= */

function buildAIPrompt() {

    const data =
        collectBasicData();


    const errors =
        validateBasicData(data);


    if (errors.length > 0) {

        throw new Error(
            errors.join("\n")
        );

    }


    const basePrompt =
        buildPrompt(data);


    const sourceContent =
        buildSourceContent();


    let finalPrompt =
        basePrompt;


    /*
       Chỉ khi có tài liệu nguồn
       mới thêm phần tài liệu.
    */

    if (sourceContent) {

        finalPrompt += `


============================================================
TÀI LIỆU NGUỒN – CHỈ DÙNG TRONG CHẾ ĐỘ AI API
============================================================

${buildSourceInstruction()}


${sourceContent}
`;

    }


    return finalPrompt;

}


/* =========================================================
   29. PROVIDER DEFAULTS
========================================================= */

function updateProviderDefaults() {

    const provider =
        $("aiProvider").value;


    const model =
        $("aiModel");


    if (
        provider === "openai" &&
        !model.value.trim()
    ) {

        model.value =
            "gpt-5";

    }


    if (
        provider === "gemini" &&
        !model.value.trim()
    ) {

        model.value =
            "gemini-2.5-flash";

    }

}


/* =========================================================
   30. GENERATE WITH AI
========================================================= */

async function generateWithAI() {

    if (AppState.aiGenerating) {

        return;

    }


    const apiKey =
        $("apiKey").value.trim();


    if (!apiKey) {

        alert(
            "Bạn chưa nhập API Key."
        );

        return;

    }


    try {

        const prompt =
            buildAIPrompt();


        const provider =
            $("aiProvider").value;


        const model =
            $("aiModel").value.trim();


        if (!model) {

            throw new Error(
                "Bạn chưa nhập model AI."
            );

        }


        AppState.aiGenerating =
            true;


        const button =
            $("generateAIButton");


        button.disabled =
            true;


        button.classList.add(
            "loading"
        );


        button.textContent =
            "Đang tạo phiếu...";


        let result;


        if (
            provider === "openai"
        ) {

            result =
                await callOpenAI(
                    apiKey,
                    model,
                    prompt
                );

        } else if (
            provider === "gemini"
        ) {

            result =
                await callGemini(
                    apiKey,
                    model,
                    prompt
                );

        } else {

            throw new Error(
                "API tùy chỉnh chưa được cấu hình."
            );

        }


        displayAIResult(
            result
        );


    } catch (error) {

        console.error(
            "AI Error:",
            error
        );


        alert(
            `Không thể tạo phiếu:\n\n${error.message}`
        );


    } finally {

        AppState.aiGenerating =
            false;


        const button =
            $("generateAIButton");


        button.disabled =
            false;


        button.classList.remove(
            "loading"
        );


        button.textContent =
            "✨ TẠO PHIẾU BẰNG AI";

    }

}


/* =========================================================
   31. OPENAI API
========================================================= */

async function callOpenAI(
    apiKey,
    model,
    prompt
) {

    const endpoint =
        "https://api.openai.com/v1/responses";


    const response =
        await fetch(
            endpoint,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`

                },

                body:
                    JSON.stringify({

                        model: model,

                        input: prompt

                    })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            extractAPIError(data)
        );

    }


    /*
       Responses API có thể trả về
       output_text trực tiếp.
    */

    if (
        typeof data.output_text ===
        "string"
    ) {

        return data.output_text;

    }


    /*
       Fallback nếu cấu trúc response
       không có output_text.
    */

    const text =
        extractOpenAIText(
            data
        );


    if (!text) {

        throw new Error(
            "AI không trả về nội dung văn bản."
        );

    }


    return text;

}


/* =========================================================
   32. EXTRACT OPENAI TEXT
========================================================= */

function extractOpenAIText(data) {

    if (
        !data ||
        !Array.isArray(
            data.output
        )
    ) {

        return "";

    }


    const parts = [];


    data.output.forEach(
        item => {

            if (
                !Array.isArray(
                    item.content
                )
            ) {

                return;

            }


            item.content.forEach(
                content => {

                    if (
                        content.type ===
                        "output_text"
                    ) {

                        parts.push(
                            content.text
                        );

                    }

                }
            );

        }
    );


    return parts.join("\n");

}


/* =========================================================
   33. GEMINI API
========================================================= */

async function callGemini(
    apiKey,
    model,
    prompt
) {

    const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;


    const response =
        await fetch(
            endpoint,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        contents: [

                            {

                                parts: [

                                    {
                                        text: prompt
                                    }

                                ]

                            }

                        ]

                    })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            extractAPIError(data)
        );

    }


    const text =
        extractGeminiText(
            data
        );


    if (!text) {

        throw new Error(
            "Gemini không trả về nội dung văn bản."
        );

    }


    return text;

}


/* =========================================================
   34. EXTRACT GEMINI TEXT
========================================================= */

function extractGeminiText(data) {

    try {

        return data
            .candidates[0]
            .content
            .parts
            .map(
                part =>
                    part.text || ""
            )
            .join("\n");

    } catch (error) {

        return "";

    }

}


/* =========================================================
   35. API ERROR
========================================================= */

function extractAPIError(data) {

    if (!data) {

        return "Không xác định được lỗi từ API.";

    }


    if (
        data.error &&
        typeof data.error.message ===
        "string"
    ) {

        return data.error.message;

    }


    if (
        data.error &&
        typeof data.error ===
        "string"
    ) {

        return data.error;

    }


    return (
        "API trả về lỗi không xác định."
    );

}


/* =========================================================
   36. DISPLAY AI RESULT
========================================================= */

function displayAIResult(text) {

    const section =
        $("aiResultSection");


    const result =
        $("aiResult");


    result.textContent =
        text;


    section.classList.remove(
        "hidden"
    );


    section.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });


    showToast(
        "AI đã tạo phiếu thành công"
    );

}


/* =========================================================
   37. TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    const toast =
        $("toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   38. KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           Ctrl + Enter:
           Tạo prompt.
        */

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            generatePrompt();

        }

    }
);


/* =========================================================
   39. DEBUG HELPER
========================================================= */

/*
   Có thể mở Console trình duyệt và dùng:

   PromptBuilder.getState()

   để kiểm tra trạng thái ứng dụng.
*/

window.PromptBuilder = {

    getState() {

        return {

            ...AppState,

            sourceFiles:
                AppState.sourceFiles.map(
                    item => ({

                        name: item.name,

                        type: item.type,

                        size: item.size,

                        supported:
                            item.supported

                    })
                )

        };

    },


    getPrompt() {

        return $("generatedPrompt")
            .value;

    },


    getTemplate() {

        return $("promptTemplate")
            .value;

    }

};


/* =========================================================
   END OF SCRIPT
========================================================= */