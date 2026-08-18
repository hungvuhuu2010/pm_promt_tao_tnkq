/* =========================================================
   AI PROMPT BUILDER
   script.js
   Phiên bản dùng hệ thống biến trong default-prompt.txt
========================================================= */

"use strict";

/* =========================================================
   1. CONFIG
========================================================= */

const DEFAULT_PROMPT_FILE = "default-prompt.txt";


/* =========================================================
   2. DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   3. DOM ELEMENTS
========================================================= */

const elements = {

    promptStatus: $("promptStatus"),

    subject: $("subject"),
    grade: $("grade"),
    topic: $("topic"),
    studentLevel: $("studentLevel"),
    purpose: $("purpose"),

    customRequirements: $("customRequirements"),

    promptFile: $("promptFile"),
    promptFileName: $("promptFileName"),
    promptTemplate: $("promptTemplate"),
    resetPromptBtn: $("resetPromptBtn"),

    generatePromptBtn: $("generatePromptBtn"),
    generatedPrompt: $("generatedPrompt"),
    copyPromptBtn: $("copyPromptBtn"),
    clearResultBtn: $("clearResultBtn"),

    advancedToggle: $("advancedToggle"),
    advancedContent: $("advancedContent"),

    sourceFiles: $("sourceFiles"),
    sourceFileList: $("sourceFileList"),

    aiProvider: $("aiProvider"),
    aiModel: $("aiModel"),
    apiKey: $("apiKey"),

    generateAIButton: $("generateAIButton"),

    aiResultSection: $("aiResultSection"),
    aiResult: $("aiResult"),

    copyAIResultBtn: $("copyAIResultBtn"),

    toast: $("toast")

};


/* =========================================================
   4. STATE
========================================================= */

const state = {

    defaultPrompt: "",

    currentPromptSource: DEFAULT_PROMPT_FILE,

    sourceFiles: [],

    matrix: {

        mcq: {
            enabled: true,
            NB: 0,
            TH: 0,
            VD: 0,
            VDC: 0,
            total: 0
        },

        tf: {
            enabled: true,
            NB: 0,
            TH: 0,
            VD: 0,
            VDC: 0,
            total: 0
        },

        short: {
            enabled: true,
            NB: 0,
            TH: 0,
            VD: 0,
            VDC: 0,
            total: 0
        }

    },

    totals: {

        NB: 0,
        TH: 0,
        VD: 0,
        VDC: 0,
        total: 0

    },

    lastPrompt: "",

    aiResult: ""

};


/* =========================================================
   5. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    setupEvents();

    updateMatrix();

    await loadDefaultPrompt();

}


/* =========================================================
   6. EVENT SETUP
========================================================= */

function setupEvents() {

    /*
       Ma trận
    */

    document
        .querySelectorAll(".matrix-input")
        .forEach(input => {

            input.addEventListener(
                "input",
                updateMatrix
            );

            input.addEventListener(
                "change",
                updateMatrix
            );

        });


    /*
       Checkbox loại câu hỏi
    */

    [
        "enableMCQ",
        "enableTF",
        "enableShort"

    ].forEach(id => {

        const checkbox = $(id);

        if (!checkbox) {
            return;
        }

        checkbox.addEventListener(
            "change",
            updateMatrix
        );

    });


    /*
       File prompt
    */

    if (elements.promptFile) {

        elements.promptFile.addEventListener(
            "change",
            handlePromptFile
        );

    }


    /*
       Khôi phục prompt mặc định
    */

    if (elements.resetPromptBtn) {

        elements.resetPromptBtn.addEventListener(
            "click",
            resetPrompt
        );

    }


    /*
       Tạo prompt
    */

    if (elements.generatePromptBtn) {

        elements.generatePromptBtn.addEventListener(
            "click",
            generatePrompt
        );

    }


    /*
       Sao chép prompt
    */

    if (elements.copyPromptBtn) {

        elements.copyPromptBtn.addEventListener(
            "click",
            () => {

                copyText(
                    elements.generatedPrompt.value,
                    "Đã sao chép prompt."
                );

            }
        );

    }


    /*
       Xóa prompt
    */

    if (elements.clearResultBtn) {

        elements.clearResultBtn.addEventListener(
            "click",
            clearResult
        );

    }


    /*
       Khối nâng cao
    */

    if (elements.advancedToggle) {

        elements.advancedToggle.addEventListener(
            "click",
            toggleAdvanced
        );

    }


    /*
       Tài liệu nguồn
    */

    if (elements.sourceFiles) {

        elements.sourceFiles.addEventListener(
            "change",
            handleSourceFiles
        );

    }


    /*
       Tạo phiếu bằng AI
    */

    if (elements.generateAIButton) {

        elements.generateAIButton.addEventListener(
            "click",
            generateWithAI
        );

    }


    /*
       Sao chép phiếu AI
    */

    if (elements.copyAIResultBtn) {

        elements.copyAIResultBtn.addEventListener(
            "click",
            () => {

                copyText(
                    elements.aiResult.innerText,
                    "Đã sao chép phiếu bài tập."
                );

            }
        );

    }

}


/* =========================================================
   7. NUMBER HELPER
========================================================= */

function getNumber(id) {

    const element = $(id);

    if (!element) {
        return 0;
    }

    let value = Number(
        element.value
    );

    if (!Number.isFinite(value)) {
        return 0;
    }

    value = Math.floor(value);

    if (value < 0) {
        value = 0;
    }

    return value;

}


/* =========================================================
   8. UPDATE MATRIX
========================================================= */

function updateMatrix() {

    const types = {

        mcq: {
            checkbox: "enableMCQ",
            totalElement: "mcqTotal"
        },

        tf: {
            checkbox: "enableTF",
            totalElement: "tfTotal"
        },

        short: {
            checkbox: "enableShort",
            totalElement: "shortTotal"
        }

    };


    /*
       Reset tổng
    */

    state.totals = {

        NB: 0,
        TH: 0,
        VD: 0,
        VDC: 0,
        total: 0

    };


    Object.keys(types).forEach(
        type => {

            const config =
                types[type];


            const checkbox =
                $(config.checkbox);


            const enabled =
                checkbox
                    ? checkbox.checked
                    : false;


            state.matrix[type].enabled =
                enabled;


            let total = 0;


            [
                "NB",
                "TH",
                "VD",
                "VDC"

            ].forEach(level => {

                const input =
                    $(
                        getMatrixInputId(
                            type,
                            level
                        )
                    );


                let value = 0;


                if (
                    enabled &&
                    input
                ) {

                    value =
                        getNumber(
                            input.id
                        );

                }


                state.matrix[type][level] =
                    value;


                total += value;


                if (enabled) {

                    state.totals[level] +=
                        value;

                }

            });


            state.matrix[type].total =
                total;


            /*
               Hiển thị tổng từng dạng
            */

            if (
                $(config.totalElement)
            ) {

                $(config.totalElement)
                    .textContent =
                    total;

            }


            /*
               Làm mờ dòng khi tắt
            */

            const row =
                checkbox
                    ? checkbox.closest("tr")
                    : null;


            if (row) {

                row.classList.toggle(
                    "disabled",
                    !enabled
                );

            }

        }
    );


    /*
       Tổng toàn phiếu
    */

    state.totals.total =
        state.totals.NB +
        state.totals.TH +
        state.totals.VD +
        state.totals.VDC;


    /*
       Hiển thị tổng
    */

    setText(
        "grandNB",
        state.totals.NB
    );

    setText(
        "grandTH",
        state.totals.TH
    );

    setText(
        "grandVD",
        state.totals.VD
    );

    setText(
        "grandVDC",
        state.totals.VDC
    );

    setText(
        "grandTotal",
        state.totals.total
    );

}


/* =========================================================
   9. MATRIX INPUT ID
========================================================= */

function getMatrixInputId(
    type,
    level
) {

    const prefix = {

        mcq: "mcq",
        tf: "tf",
        short: "short"

    }[type];


    return `${prefix}${level}`;

}


/* =========================================================
   10. SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element = $(id);

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   11. LOAD DEFAULT PROMPT
========================================================= */

async function loadDefaultPrompt() {

    updateStatus(
        "Đang tải prompt mẫu...",
        "loading"
    );


    try {

        const response =
            await fetch(
                DEFAULT_PROMPT_FILE,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const text =
            await response.text();


        if (!text.trim()) {

            throw new Error(
                "File prompt mẫu trống."
            );

        }


        state.defaultPrompt =
            text;


        state.currentPromptSource =
            DEFAULT_PROMPT_FILE;


        if (
            elements.promptTemplate
        ) {

            elements.promptTemplate.value =
                text;

        }


        if (
            elements.promptFileName
        ) {

            elements.promptFileName.textContent =
                `Nguồn: ${DEFAULT_PROMPT_FILE}`;

        }


        updateStatus(
            "Đã tải prompt mẫu",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Không đọc được default-prompt.txt:",
            error
        );


        if (
            elements.promptFileName
        ) {

            elements.promptFileName.textContent =
                "Không tìm thấy default-prompt.txt.";

        }


        updateStatus(
            "Chưa có prompt mẫu",
            "error"
        );


        showToast(
            "Không đọc được default-prompt.txt."
        );

    }

}


/* =========================================================
   12. HANDLE CUSTOM PROMPT FILE
========================================================= */

async function handlePromptFile(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();


        if (!text.trim()) {

            showToast(
                "File prompt đang trống."
            );

            return;

        }


        elements.promptTemplate.value =
            text;


        state.currentPromptSource =
            file.name;


        if (
            elements.promptFileName
        ) {

            elements.promptFileName.textContent =
                `Nguồn: ${file.name}`;

        }


        updateStatus(
            "Đã tải prompt riêng",
            "success"
        );


        showToast(
            "Đã tải prompt mẫu."
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Không đọc được file prompt."
        );

    }

}


/* =========================================================
   13. RESET PROMPT
========================================================= */

async function resetPrompt() {

    if (
        state.defaultPrompt &&
        state.defaultPrompt.trim()
    ) {

        elements.promptTemplate.value =
            state.defaultPrompt;


        state.currentPromptSource =
            DEFAULT_PROMPT_FILE;


        if (
            elements.promptFileName
        ) {

            elements.promptFileName.textContent =
                `Nguồn: ${DEFAULT_PROMPT_FILE}`;

        }


        updateStatus(
            "Đã khôi phục prompt mặc định",
            "success"
        );


        showToast(
            "Đã khôi phục prompt mặc định."
        );


        return;

    }


    await loadDefaultPrompt();

}


/* =========================================================
   14. GET BASIC INFORMATION
========================================================= */

function getBasicInformation() {

    return {

        MON_HOC:
            getValue(
                elements.subject
            ),

        LOP:
            getValue(
                elements.grade
            ),

        CHU_DE:
            getValue(
                elements.topic
            ),

        DOI_TUONG:
            getValue(
                elements.studentLevel
            ) ||
            "Không chỉ định",

        MUC_DICH_SU_DUNG:
            getValue(
                elements.purpose
            ) ||
            "Luyện tập và củng cố kiến thức",

        YEU_CAU_RIENG:
            getValue(
                elements.customRequirements
            ) ||
            "Không có yêu cầu riêng."

    };

}


/* =========================================================
   15. GET VALUE
========================================================= */

function getValue(element) {

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   16. GET MATRIX VARIABLES
========================================================= */

function getMatrixVariables() {

    return {

        /*
           Tổng
        */

        TONG_SO_CAU:
            state.totals.total,


        /*
           Trắc nghiệm
        */

        MCQ_NB:
            state.matrix.mcq.NB,

        MCQ_TH:
            state.matrix.mcq.TH,

        MCQ_VD:
            state.matrix.mcq.VD,

        MCQ_VDC:
            state.matrix.mcq.VDC,

        MCQ_TONG:
            state.matrix.mcq.total,


        /*
           Đúng / Sai
        */

        TF_NB:
            state.matrix.tf.NB,

        TF_TH:
            state.matrix.tf.TH,

        TF_VD:
            state.matrix.tf.VD,

        TF_VDC:
            state.matrix.tf.VDC,

        TF_TONG:
            state.matrix.tf.total,


        /*
           Trả lời ngắn
        */

        SHORT_NB:
            state.matrix.short.NB,

        SHORT_TH:
            state.matrix.short.TH,

        SHORT_VD:
            state.matrix.short.VD,

        SHORT_VDC:
            state.matrix.short.VDC,

        SHORT_TONG:
            state.matrix.short.total

    };

}


/* =========================================================
   17. SOURCE VARIABLES
========================================================= */

function getSourceVariables() {

    return {

        CHE_DO_TAI_LIEU:
            getSourceModeText(),

        TAI_LIEU_NGUON:
            getSourceText()

    };

}


/* =========================================================
   18. SOURCE MODE
========================================================= */

function getSourceModeText() {

    const selected =
        document.querySelector(
            'input[name="sourceMode"]:checked'
        );


    if (!selected) {

        return "Không sử dụng tài liệu nguồn.";

    }


    const modes = {

        reference:
            "Tham khảo tài liệu để xác định nội dung và phạm vi kiến thức.",

        strict:
            "Bám sát tài liệu nguồn, hạn chế mở rộng ngoài tài liệu.",

        only:
            "Chỉ sử dụng kiến thức có trong tài liệu nguồn."

    };


    return (
        modes[selected.value] ||
        selected.value
    );

}


/* =========================================================
   19. SOURCE TEXT
========================================================= */

function getSourceText() {

    if (
        !state.sourceFiles.length
    ) {

        return "Không có tài liệu nguồn.";

    }


    const result = [];


    state.sourceFiles.forEach(
        (item, index) => {

            result.push(
                `--- TÀI LIỆU ${index + 1}: ${item.name} ---`
            );


            if (
                item.text &&
                item.text.trim()
            ) {

                result.push(
                    item.text.trim()
                );

            }

            else {

                result.push(
                    "[Nội dung file này chưa được trích xuất ở chế độ HTML hiện tại.]"
                );

            }


            result.push("");

        }
    );


    return result.join("\n");

}


/* =========================================================
   20. ALL VARIABLES
========================================================= */

function getAllVariables(
    includeSources = false
) {

    const variables = {

        ...getBasicInformation(),

        ...getMatrixVariables()

    };


    if (includeSources) {

        Object.assign(
            variables,
            getSourceVariables()
        );

    }

    else {

        /*
           Nếu không dùng API/tài liệu nâng cao,
           vẫn thay biến tài liệu để prompt không còn
           [TAI_LIEU_NGUON].
        */

        variables.CHE_DO_TAI_LIEU =
            "Không sử dụng tài liệu nguồn.";

        variables.TAI_LIEU_NGUON =
            "Không có tài liệu nguồn.";

    }


    return variables;

}


/* =========================================================
   21. REPLACE VARIABLES
========================================================= */

/*
   Ví dụ:

   [MON_HOC]
   [LOP]
   [MUC_DICH_SU_DUNG]
   [MCQ_NB]

   sẽ được thay bằng dữ liệu thực tế.
*/

function replaceVariables(
    template,
    variables
) {

    let result =
        String(template);


    Object.keys(variables)
        .forEach(
            key => {

                const token =
                    `[${key}]`;


                const value =
                    variables[key] ?? "";


                /*
                   replaceAll được dùng để
                   thay tất cả vị trí xuất hiện.
                */

                result =
                    result.replaceAll(
                        token,
                        String(value)
                    );

            }
        );


    return result;

}


/* =========================================================
   22. FIND UNUSED VARIABLES
========================================================= */

function findUnusedVariables(
    prompt
) {

    const matches =
        prompt.match(
            /\[[A-Z0-9_]+\]/g
        );


    if (!matches) {

        return [];

    }


    return [
        ...new Set(matches)
    ];

}


/* =========================================================
   23. VALIDATE
========================================================= */

function validateBeforeGenerate() {

    updateMatrix();


    const info =
        getBasicInformation();


    if (!info.MON_HOC) {

        showToast(
            "Vui lòng nhập môn học."
        );

        elements.subject?.focus();

        return false;

    }


    if (!info.LOP) {

        showToast(
            "Vui lòng nhập lớp."
        );

        elements.grade?.focus();

        return false;

    }


    if (!info.CHU_DE) {

        showToast(
            "Vui lòng nhập chủ đề / bài học."
        );

        elements.topic?.focus();

        return false;

    }


    if (
        state.totals.total <= 0
    ) {

        showToast(
            "Tổng số câu phải lớn hơn 0."
        );

        return false;

    }


    const template =
        getValue(
            elements.promptTemplate
        );


    if (!template) {

        showToast(
            "Chưa có prompt mẫu."
        );

        elements.promptTemplate?.focus();

        return false;

    }


    return true;

}


/* =========================================================
   24. BUILD PROMPT
========================================================= */

function buildPrompt(
    options = {}
) {

    const includeSources =
        Boolean(
            options.includeSources
        );


    const template =
        getValue(
            elements.promptTemplate
        );


    const variables =
        getAllVariables(
            includeSources
        );


    /*
       Thay biến
    */

    const prompt =
        replaceVariables(
            template,
            variables
        );


    return {

        prompt: prompt.trim(),

        variables,

        unusedVariables:
            findUnusedVariables(
                prompt
            )

    };

}


/* =========================================================
   25. GENERATE PROMPT
========================================================= */

function generatePrompt() {

    if (
        !validateBeforeGenerate()
    ) {

        return;

    }


    const result =
        buildPrompt({
            includeSources: false
        });


    state.lastPrompt =
        result.prompt;


    elements.generatedPrompt.value =
        result.prompt;


    /*
       Nếu prompt mẫu còn biến chưa được
       ứng dụng xử lý, cảnh báo nhẹ.
    */

    if (
        result.unusedVariables.length
    ) {

        console.warn(
            "Biến chưa được thay:",
            result.unusedVariables
        );

    }


    updateStatus(
        "Đã tạo prompt",
        "success"
    );


    showToast(
        "Đã tạo prompt hoàn chỉnh."
    );


    elements.generatedPrompt
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


/* =========================================================
   26. SOURCE FILES
========================================================= */

async function handleSourceFiles(
    event
) {

    const files =
        Array.from(
            event.target.files || []
        );


    if (!files.length) {
        return;
    }


    for (
        const file of files
    ) {

        const item = {

            file,

            name:
                file.name,

            size:
                file.size,

            type:
                file.type,

            text:
                null

        };


        /*
           TXT / MD có thể đọc trực tiếp
        */

        const lowerName =
            file.name.toLowerCase();


        if (
            lowerName.endsWith(".txt") ||
            lowerName.endsWith(".md")
        ) {

            try {

                item.text =
                    await file.text();

            }

            catch (error) {

                console.error(
                    error
                );

            }

        }


        state.sourceFiles.push(
            item
        );

    }


    renderSourceFiles();


    /*
       Reset input để có thể
       chọn lại cùng file
    */

    event.target.value = "";

}


/* =========================================================
   27. RENDER SOURCE FILES
========================================================= */

function renderSourceFiles() {

    const container =
        elements.sourceFileList;


    if (!container) {
        return;
    }


    if (
        !state.sourceFiles.length
    ) {

        container.textContent =
            "Chưa có tài liệu.";

        return;

    }


    container.innerHTML = "";


    state.sourceFiles.forEach(
        (item, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "file-item";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "file-item-name";


            name.textContent =
                item.name;


            const remove =
                document.createElement(
                    "button"
                );


            remove.type =
                "button";


            remove.className =
                "file-item-remove";


            remove.textContent =
                "×";


            remove.title =
                "Xóa tài liệu";


            remove.addEventListener(
                "click",
                () => {

                    state.sourceFiles.splice(
                        index,
                        1
                    );


                    renderSourceFiles();

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
   28. TOGGLE ADVANCED
========================================================= */

function toggleAdvanced() {

    if (
        !elements.advancedContent
    ) {

        return;

    }


    const hidden =
        elements.advancedContent
            .classList
            .contains("hidden");


    elements.advancedContent
        .classList
        .toggle(
            "hidden",
            !hidden
        );


    if (
        elements.advancedToggle
    ) {

        elements.advancedToggle
            .classList
            .toggle(
                "open",
                hidden
            );


        elements.advancedToggle
            .setAttribute(
                "aria-expanded",
                String(hidden)
            );

    }

}


/* =========================================================
   29. CLEAR RESULT
========================================================= */

function clearResult() {

    if (
        elements.generatedPrompt
    ) {

        elements.generatedPrompt.value =
            "";

    }


    state.lastPrompt =
        "";


    showToast(
        "Đã xóa prompt."
    );

}


/* =========================================================
   30. COPY TEXT
========================================================= */

async function copyText(
    text,
    successMessage
) {

    if (
        !text ||
        !text.trim()
    ) {

        showToast(
            "Không có nội dung để sao chép."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        showToast(
            successMessage ||
            "Đã sao chép."
        );

    }

    catch (error) {

        /*
           Fallback
        */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        try {

            document.execCommand(
                "copy"
            );


            showToast(
                successMessage ||
                "Đã sao chép."
            );

        }

        catch (copyError) {

            console.error(
                copyError
            );


            showToast(
                "Không thể sao chép."
            );

        }


        textarea.remove();

    }

}


/* =========================================================
   31. API VALIDATION
========================================================= */

function validateAPISettings() {

    const provider =
        getValue(
            elements.aiProvider
        );


    const apiKey =
        getValue(
            elements.apiKey
        );


    const model =
        getValue(
            elements.aiModel
        );


    if (!provider) {

        showToast(
            "Vui lòng chọn AI Provider."
        );

        return false;

    }


    if (!apiKey) {

        showToast(
            "Bạn chưa nhập API Key."
        );

        elements.apiKey?.focus();

        return false;

    }


    if (!model) {

        showToast(
            "Bạn chưa nhập tên model."
        );

        elements.aiModel?.focus();

        return false;

    }


    return true;

}


/* =========================================================
   32. GENERATE WITH AI
========================================================= */

async function generateWithAI() {

    if (
        !validateBeforeGenerate()
    ) {

        return;

    }


    if (
        !validateAPISettings()
    ) {

        return;

    }


    /*
       Khi dùng AI/API:
       - Prompt vẫn được tạo từ template.
       - Đồng thời cho phép đưa tài liệu nguồn vào.
    */

    const result =
        buildPrompt({
            includeSources: true
        });


    const prompt =
        result.prompt;


    const provider =
        getValue(
            elements.aiProvider
        );


    const apiKey =
        getValue(
            elements.apiKey
        );


    const model =
        getValue(
            elements.aiModel
        );


    elements.generateAIButton.disabled =
        true;


    elements.generateAIButton.textContent =
        "⏳ Đang tạo phiếu...";


    try {

        let output;


        if (
            provider === "openai"
        ) {

            output =
                await callOpenAI(
                    prompt,
                    apiKey,
                    model
                );

        }

        else if (
            provider === "gemini"
        ) {

            output =
                await callGemini(
                    prompt,
                    apiKey,
                    model
                );

        }

        else {

            throw new Error(
                "AI Provider chưa được hỗ trợ."
            );

        }


        state.aiResult =
            output;


        if (
            elements.aiResult
        ) {

            elements.aiResult.textContent =
                output;

        }


        if (
            elements.aiResultSection
        ) {

            elements.aiResultSection
                .classList
                .remove("hidden");

        }


        showToast(
            "AI đã tạo phiếu bài tập."
        );

    }

    catch (error) {

        console.error(
            error
        );


        if (
            elements.aiResultSection
        ) {

            elements.aiResultSection
                .classList
                .remove("hidden");

        }


        if (
            elements.aiResult
        ) {

            elements.aiResult.textContent =
                "Không thể tạo phiếu.\n\n" +
                error.message;

        }


        showToast(
            "Lỗi khi gọi AI."
        );

    }

    finally {

        elements.generateAIButton.disabled =
            false;


        elements.generateAIButton.textContent =
            "✨ TẠO PHIẾU BẰNG AI";

    }

}


/* =========================================================
   33. OPENAI
========================================================= */

async function callOpenAI(
    prompt,
    apiKey,
    model
) {

    const response =
        await fetch(
            "https://api.openai.com/v1/responses",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`

                },

                body: JSON.stringify({

                    model: model,

                    input: prompt

                })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            `OpenAI API lỗi HTTP ${response.status}`
        );

    }


    if (
        typeof data.output_text ===
        "string"
    ) {

        return data.output_text;

    }


    return extractOpenAIText(
        data
    );

}


/* =========================================================
   34. EXTRACT OPENAI TEXT
========================================================= */

function extractOpenAIText(
    data
) {

    const result = [];


    if (
        Array.isArray(
            data.output
        )
    ) {

        data.output.forEach(
            item => {

                if (
                    Array.isArray(
                        item.content
                    )
                ) {

                    item.content.forEach(
                        part => {

                            if (
                                typeof part.text ===
                                "string"
                            ) {

                                result.push(
                                    part.text
                                );

                            }

                        }
                    );

                }

            }
        );

    }


    if (
        result.length
    ) {

        return result.join(
            "\n"
        );

    }


    return JSON.stringify(
        data,
        null,
        2
    );

}


/* =========================================================
   35. GEMINI
========================================================= */

async function callGemini(
    prompt,
    apiKey,
    model
) {

    const url =
        "https://generativelanguage.googleapis.com/" +
        "v1beta/models/" +
        encodeURIComponent(model) +
        ":generateContent?key=" +
        encodeURIComponent(apiKey);


    const response =
        await fetch(
            url,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

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
            data?.error?.message ||
            `Gemini API lỗi HTTP ${response.status}`
        );

    }


    const text =
        data
            ?.candidates?.[0]
            ?.content?.parts
            ?.map(
                part =>
                    part.text || ""
            )
            .join("\n");


    if (!text) {

        throw new Error(
            "Gemini không trả về nội dung."
        );

    }


    return text;

}


/* =========================================================
   36. STATUS
========================================================= */

function updateStatus(
    text,
    type = ""
) {

    if (
        !elements.promptStatus
    ) {

        return;

    }


    elements.promptStatus.textContent =
        text;


    elements.promptStatus.className =
        "status-badge";


    if (type) {

        elements.promptStatus.classList.add(
            type
        );

    }

}


/* =========================================================
   37. TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    if (
        !elements.toast
    ) {

        return;

    }


    elements.toast.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   38. DEBUG
========================================================= */

window.getPromptBuilderState =
    function () {

        updateMatrix();


        return {

            basic:
                getBasicInformation(),

            matrix:
                structuredClone(
                    state.matrix
                ),

            totals:
                structuredClone(
                    state.totals
                ),

            promptSource:
                state.currentPromptSource,

            sourceFiles:
                state.sourceFiles.map(
                    item =>
                        item.name
                ),

            lastPrompt:
                state.lastPrompt

        };

    };


/* =========================================================
   39. TEST VARIABLE SYSTEM
========================================================= */

/*
   Mở Console trình duyệt và chạy:

   testPromptVariables()

   để kiểm tra các biến trong default-prompt.txt.
*/

window.testPromptVariables =
    function () {

        const template =
            getValue(
                elements.promptTemplate
            );


        if (!template) {

            console.log(
                "Chưa có prompt template."
            );

            return;

        }


        const variables =
            getAllVariables(
                false
            );


        const result =
            replaceVariables(
                template,
                variables
            );


        console.log(
            "===== VARIABLES ====="
        );

        console.table(
            variables
        );


        console.log(
            "===== PROMPT ====="
        );

        console.log(
            result
        );


        console.log(
            "===== BIẾN CHƯA THAY ====="
        );

        console.log(
            findUnusedVariables(
                result
            )
        );


        return result;

    };


/* =========================================================
   END
========================================================= */
