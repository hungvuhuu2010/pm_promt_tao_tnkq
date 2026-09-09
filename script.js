/* =========================================================
   AI PROMPT BUILDER - script.js
   Bảo toàn chức năng cũ & Bổ sung Thẻ 2, Thẻ 3
========================================================= */

// State quản lý dữ liệu ứng dụng
const state = {
    activeTab: 'no-matrix', // 'no-matrix', 'with-matrix', hoặc 'generate-matrix'
    promptTemplate: '',
    matrixPromptTemplate: '',
    buildMatrixPromptTemplate: '',
    sourceFiles: [],
    sourceMode: 'reference'
};

// Chuỗi Prompt mặc định cho Tab 2 (theo Ma trận) nếu chưa tải được file default_prompt2.txt
const DEFAULT_MATRIX_PROMPT = `VAI TRÒ VÀ NHIỆM VỤ:
Bạn là chuyên gia thiết kế câu hỏi kiểm tra đánh giá. Hãy xây dựng phiếu bài tập dựa trên Ma trận chi tiết bên dưới.

I. THÔNG TIN CHUNG:
- Môn học: {MON_HOC}
- Lớp: {LOP}
- Chủ đề: {CHU_DE}

II. MA TRẬN CHI TIẾT DẠNG CÂU HỎI:

1. PHẦN 1: Trắc nghiệm 4 lựa chọn
{BANG_PHAN_1}

2. PHẦN 2: Trắc nghiệm Đúng/Sai (4 mệnh đề)
{BANG_PHAN_2}

3. PHẦN 3: Trắc nghiệm Trả lời ngắn
{BANG_PHAN_3}

4. PHẦN 4: Tự luận / Khác
{BANG_PHAN_4}

III. YÊU CẦU:
1. Tạo đúng số lượng, dạng câu hỏi và mức độ nhận thức theo bảng ma trận chi tiết trên.
2. Với từng câu hỏi, cung cấp đầy đủ đáp án và lời giải chi tiết.
`;


/* =========================================================
   LƯU / IMPORT CẤU HÌNH THẺ 1
   ========================================================= */

function getTab1Config() {
    return {
        subject: document.getElementById('subject')?.value || '',
        grade: document.getElementById('grade')?.value || '',
        topic: document.getElementById('topic')?.value || '',
        studentLevel: document.getElementById('studentLevel')?.value || '',
        purpose: document.getElementById('purpose')?.value || '',

        mcq: {
            enabled: document.getElementById('enableMCQ')?.checked ?? false,
            NB: document.getElementById('mcqNB')?.value || '0',
            TH: document.getElementById('mcqTH')?.value || '0',
            VD: document.getElementById('mcqVD')?.value || '0',
            VDC: document.getElementById('mcqVDC')?.value || '0'
        },

        tf: {
            enabled: document.getElementById('enableTF')?.checked ?? false,
            NB: document.getElementById('tfNB')?.value || '0',
            TH: document.getElementById('tfTH')?.value || '0',
            VD: document.getElementById('tfVD')?.value || '0',
            VDC: document.getElementById('tfVDC')?.value || '0'
        },

        short: {
            enabled: document.getElementById('enableShort')?.checked ?? false,
            NB: document.getElementById('shortNB')?.value || '0',
            TH: document.getElementById('shortTH')?.value || '0',
            VD: document.getElementById('shortVD')?.value || '0',
            VDC: document.getElementById('shortVDC')?.value || '0'
        },

        fill: {
            enabled: document.getElementById('enableFill')?.checked ?? false,
            NB: document.getElementById('fillNB')?.value || '0',
            TH: document.getElementById('fillTH')?.value || '0',
            VD: document.getElementById('fillVD')?.value || '0',
            VDC: document.getElementById('fillVDC')?.value || '0'
        },

        sort: {
            enabled: document.getElementById('enableSort')?.checked ?? false,
            NB: document.getElementById('sortNB')?.value || '0',
            TH: document.getElementById('sortTH')?.value || '0',
            VD: document.getElementById('sortVD')?.value || '0',
            VDC: document.getElementById('sortVDC')?.value || '0'
        }
    };
}


/* ---------------------------------------------------------
   Chuyển cấu hình thành file TXT
   --------------------------------------------------------- */

function configToTxt(config) {
    return `[THONG_TIN_BAI_TAP]
subject=${config.subject}
grade=${config.grade}
topic=${config.topic}
studentLevel=${config.studentLevel}
purpose=${config.purpose}

[TRAC_NGHIEM]
enabled=${config.mcq.enabled}
NB=${config.mcq.NB}
TH=${config.mcq.TH}
VD=${config.mcq.VD}
VDC=${config.mcq.VDC}

[DUNG_SAI]
enabled=${config.tf.enabled}
NB=${config.tf.NB}
TH=${config.tf.TH}
VD=${config.tf.VD}
VDC=${config.tf.VDC}

[TRA_LOI_NGAN]
enabled=${config.short.enabled}
NB=${config.short.NB}
TH=${config.short.TH}
VD=${config.short.VD}
VDC=${config.short.VDC}

[DIEN_KHUYET]
enabled=${config.fill.enabled}
NB=${config.fill.NB}
TH=${config.fill.TH}
VD=${config.fill.VD}
VDC=${config.fill.VDC}

[SAP_XEP]
enabled=${config.sort.enabled}
NB=${config.sort.NB}
TH=${config.sort.TH}
VD=${config.sort.VD}
VDC=${config.sort.VDC}
`;
}


/* ---------------------------------------------------------
   Lưu cấu hình Thẻ 1
   --------------------------------------------------------- */

function saveTab1Config() {
    const config = getTab1Config();
    const txt = configToTxt(config);

    const blob = new Blob([txt], {
        type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);

    const subject = config.subject.trim() || 'Cau_hinh';
    const topic = config.topic.trim() || 'Tab1';

    const safeName = `${subject}_${topic}`
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_');

    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.txt`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    showToast('Đã lưu cấu hình Thẻ 1!');
}


/* ---------------------------------------------------------
   Đọc file TXT thành object
   --------------------------------------------------------- */

function parseConfigTxt(txt) {

    const config = {
        subject: '',
        grade: '',
        topic: '',
        studentLevel: '',
        purpose: '',

        mcq: { enabled: true, NB: '0', TH: '0', VD: '0', VDC: '0' },
        tf: { enabled: true, NB: '0', TH: '0', VD: '0', VDC: '0' },
        short: { enabled: true, NB: '0', TH: '0', VD: '0', VDC: '0' },
        fill: { enabled: true, NB: '0', TH: '0', VD: '0', VDC: '0' },
        sort: { enabled: true, NB: '0', TH: '0', VD: '0', VDC: '0' }
    };

    let section = '';

    const lines = txt.split(/\r?\n/);

    lines.forEach(line => {

        line = line.trim();

        if (!line || line.startsWith('#')) return;

        // Xác định section
        if (line.startsWith('[') && line.endsWith(']')) {
            section = line.substring(1, line.length - 1);
            return;
        }

        const index = line.indexOf('=');

        if (index === -1) return;

        const key = line.substring(0, index).trim();
        const value = line.substring(index + 1).trim();

        if (section === 'THONG_TIN_BAI_TAP') {

            if (key === 'subject') config.subject = value;
            if (key === 'grade') config.grade = value;
            if (key === 'topic') config.topic = value;
            if (key === 'studentLevel') config.studentLevel = value;
            if (key === 'purpose') config.purpose = value;

        } else if (section === 'TRAC_NGHIEM') {

            config.mcq[key] =
                key === 'enabled' ? value === 'true' : value;

        } else if (section === 'DUNG_SAI') {

            config.tf[key] =
                key === 'enabled' ? value === 'true' : value;

        } else if (section === 'TRA_LOI_NGAN') {

            config.short[key] =
                key === 'enabled' ? value === 'true' : value;

        } else if (section === 'DIEN_KHUYET') {

            config.fill[key] =
                key === 'enabled' ? value === 'true' : value;

        } else if (section === 'SAP_XEP') {

            config.sort[key] =
                key === 'enabled' ? value === 'true' : value;
        }
    });

    return config;
}


/* ---------------------------------------------------------
   Điền cấu hình vào giao diện
   --------------------------------------------------------- */

function applyTab1Config(config) {

    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value ?? '';
    };

    const setChecked = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!value;
    };

    // Thông tin chung
    setValue('subject', config.subject);
    setValue('grade', config.grade);
    setValue('topic', config.topic);
    setValue('studentLevel', config.studentLevel);
    setValue('purpose', config.purpose);

    // Trắc nghiệm
    setChecked('enableMCQ', config.mcq.enabled);
    setValue('mcqNB', config.mcq.NB);
    setValue('mcqTH', config.mcq.TH);
    setValue('mcqVD', config.mcq.VD);
    setValue('mcqVDC', config.mcq.VDC);

    // Đúng / Sai
    setChecked('enableTF', config.tf.enabled);
    setValue('tfNB', config.tf.NB);
    setValue('tfTH', config.tf.TH);
    setValue('tfVD', config.tf.VD);
    setValue('tfVDC', config.tf.VDC);

    // Trả lời ngắn
    setChecked('enableShort', config.short.enabled);
    setValue('shortNB', config.short.NB);
    setValue('shortTH', config.short.TH);
    setValue('shortVD', config.short.VD);
    setValue('shortVDC', config.short.VDC);

    // Điền khuyết
    setChecked('enableFill', config.fill.enabled);
    setValue('fillNB', config.fill.NB);
    setValue('fillTH', config.fill.TH);
    setValue('fillVD', config.fill.VD);
    setValue('fillVDC', config.fill.VDC);

    // Sắp xếp
    setChecked('enableSort', config.sort.enabled);
    setValue('sortNB', config.sort.NB);
    setValue('sortTH', config.sort.TH);
    setValue('sortVD', config.sort.VD);
    setValue('sortVDC', config.sort.VDC);

    // Cập nhật tổng
    updateNoMatrixTotals();

    showToast('Đã import cấu hình thành công!');
}


/* ---------------------------------------------------------
   Import file TXT
   --------------------------------------------------------- */

function importTab1Config(event) {

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
        showToast('Vui lòng chọn file cấu hình .txt!');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const txt = e.target.result;

            if (!txt || !txt.trim()) {
                throw new Error('File rỗng');
            }

            const config = parseConfigTxt(txt);

            applyTab1Config(config);

        } catch (error) {

            console.error('Lỗi import cấu hình:', error);
            showToast('File cấu hình không đúng định dạng!');

        }

        // Cho phép chọn lại đúng file lần nữa
        event.target.value = '';
    };

    reader.onerror = function() {
        showToast('Không thể đọc file cấu hình!');
        event.target.value = '';
    };

    reader.readAsText(file, 'UTF-8');
}
/* =========================================================
   1. KHỞI TẠO VÀ CHUYỂN TAB
========================================================= */


document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    calculateMatrixTotals();
});

function initApp() {
    // Tải prompt mặc định cho Tab 1, Tab 2, Tab 3
    loadDefaultPrompt();
    loadDefaultMatrixPrompt();
    loadDefaultBuildMatrixPrompt();
    
    // Cập nhật ma trận đơn giản (Tab 1)
    updateNoMatrixTotals();
    
    // Khôi phục tab cũ từ localStorage nếu có
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        switchTab(savedTab);
    }
}

function switchTab(tabName) {
    state.activeTab = tabName;
    localStorage.setItem('activeTab', tabName);

    const btn1 = document.getElementById('tabNoMatrixBtn');
    const btn2 = document.getElementById('tabWithMatrixBtn');
    const btn3 = document.getElementById('tabGenerateMatrixBtn');

    const tab1 = document.getElementById('tabNoMatrix');
    const tab2 = document.getElementById('tabWithMatrix');
    const tab3 = document.getElementById('tabGenerateMatrix');

    [btn1, btn2, btn3].forEach(b => b?.classList.remove('active'));
    [tab1, tab2, tab3].forEach(t => t?.classList.remove('active'));

    if (tabName === 'no-matrix') {
        btn1?.classList.add('active');
        tab1?.classList.add('active');
    } else if (tabName === 'with-matrix') {
        btn2?.classList.add('active');
        tab2?.classList.add('active');
    } else if (tabName === 'generate-matrix') {
        btn3?.classList.add('active');
        tab3?.classList.add('active');
    }
}

/* =========================================================
   2. TẢI VÀ XỬ LÝ PROMPT TEMPLATE (TAB 1, TAB 2 & TAB 3)
========================================================= */

function loadDefaultPrompt() {
    const statusBadge = document.getElementById('promptStatus');
    const fileNameDiv = document.getElementById('promptFileName');
    const textarea = document.getElementById('promptTemplate');

    if (statusBadge) statusBadge.className = 'status-badge loading', statusBadge.textContent = 'Đang tải prompt...';

    fetch('default_prompt.txt')
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy default_prompt.txt');
            return res.text();
        })
        .then(text => {
            state.promptTemplate = text;
            if (textarea) textarea.value = text;
            if (statusBadge) statusBadge.className = 'status-badge success', statusBadge.textContent = 'Sẵn sàng';
            if (fileNameDiv) fileNameDiv.textContent = 'Nguồn: default_prompt.txt (mặc định)';
        })
        .catch(err => {
            console.warn('Lỗi tải default_prompt.txt:', err);
            if (statusBadge) statusBadge.className = 'status-badge error', statusBadge.textContent = 'Chưa có prompt';
            if (fileNameDiv) fileNameDiv.textContent = 'Nguồn: Không tìm thấy file mẫu';
        });
}

function loadDefaultMatrixPrompt() {
    fetch('default_prompt2.txt')
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy default_prompt2.txt');
            return res.text();
        })
        .then(text => {
            state.matrixPromptTemplate = text;
        })
        .catch(err => {
            console.warn('Lỗi tải default_prompt2.txt, dùng template dự phòng:', err);
            state.matrixPromptTemplate = DEFAULT_MATRIX_PROMPT;
        });
}

function loadDefaultBuildMatrixPrompt() {
    fetch('default_prompt3.txt')
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy default_prompt3.txt');
            return res.text();
        })
        .then(text => {
            state.buildMatrixPromptTemplate = text;
        })
        .catch(err => {
            console.warn('Lỗi tải default_prompt3.txt:', err);
        });
}

/* =========================================================
   3. LOGIC TAB 1: TẠO PHIẾU KHÔNG THEO MA TRẬN
========================================================= */

function updateNoMatrixTotals() {
    const questionTypes = [
        { key: 'mcq', enable: 'enableMCQ' },
        { key: 'tf', enable: 'enableTF' },
        { key: 'short', enable: 'enableShort' },
        { key: 'fill', enable: 'enableFill' },
        { key: 'sort', enable: 'enableSort' }
    ];

    const levels = ['NB', 'TH', 'VD', 'VDC'];

    const getVal = (id) =>
        Math.max(0, parseInt(document.getElementById(id)?.value || 0, 10));

    const setTxt = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    const totals = {};

    questionTypes.forEach(type => {
        const enabled =
            document.getElementById(type.enable)?.checked ?? true;

        totals[type.key] = {};

        levels.forEach(level => {
            totals[type.key][level] = enabled
                ? getVal(`${type.key}${level}`)
                : 0;
        });

        totals[type.key].total = levels.reduce(
            (sum, level) => sum + totals[type.key][level],
            0
        );

        setTxt(
            `${type.key}Total`,
            totals[type.key].total
        );
    });

    const grand = {
        NB: 0,
        TH: 0,
        VD: 0,
        VDC: 0,
        total: 0
    };

    questionTypes.forEach(type => {
        levels.forEach(level => {
            grand[level] += totals[type.key][level];
        });

        grand.total += totals[type.key].total;
    });

    levels.forEach(level => {
        setTxt(`grand${level}`, grand[level]);
    });

    setTxt('grandTotal', grand.total);
}

function generateNoMatrixPrompt() {
    let template =
        document.getElementById('promptTemplate')?.value ||
        state.promptTemplate;

    if (!template) {
        showToast('Vui lòng nhập hoặc tải Prompt mẫu!');
        return;
    }

    // Lấy giá trị nhập vào, nếu trống thì giữ nguyên tên nhãn placeholder
    const subject = document.getElementById('subject')?.value.trim() || '[MON_HOC]';
    const grade = document.getElementById('grade')?.value.trim() || '[LOP]';
    const topic = document.getElementById('topic')?.value.trim() || '[CHU_DE]';
    const studentLevel = document.getElementById('studentLevel')?.value.trim() || '[DOI_TUONG]';
    const purpose = document.getElementById('purpose')?.value.trim() || '[MUC_DICH_SU_DUNG]';

    // Hàm thay thế an toàn chống lỗi mất chuỗi khi chứa ký tự đặc biệt
    const safeReplace = (str, pattern, replacement) => {
        return str.replace(pattern, () => replacement);
    };

    // Thay thế Thông tin chung
    template = safeReplace(template, /\[MON_HOC\]/g, subject);
    template = safeReplace(template, /\[LOP\]/g, grade);
    template = safeReplace(template, /\[CHU_DE\]/g, topic);
    template = safeReplace(template, /\[DOI_TUONG\]/g, studentLevel);
    template = safeReplace(template, /\[MUC_DICH_SU_DUNG\]/g, purpose);

    const getVal = (id) => document.getElementById(id)?.value || '0';
    const getTotal = (id) => document.getElementById(id)?.textContent || '0';

    // Các dạng câu hỏi
    const types = ['MCQ', 'TF', 'SHORT', 'FILL', 'SORT'];

    // Thay thế các biến ma trận [MCQ_NB], [MCQ_TH]...
    types.forEach(type => {
        ['NB', 'TH', 'VD', 'VDC'].forEach(level => {
            const val = getVal(`${type.toLowerCase()}${level}`);
            template = safeReplace(template, new RegExp(`\\[${type}_${level}\\]`, 'g'), val);
        });

        const totalVal = getTotal(`${type.toLowerCase()}Total`);
        template = safeReplace(template, new RegExp(`\\[${type}_TONG\\]`, 'g'), totalVal);
    });

    // Thay thế tổng số câu
    template = safeReplace(template, /\[TONG_SO_CAU\]/g, getTotal('grandTotal'));

    // Xử lý Yêu cầu riêng & Tài liệu nguồn nếu có
    const customReq = document.getElementById('customRequirements')?.value.trim() || 'Không có yêu cầu riêng.';
    template = safeReplace(template, /\[YEU_CAU_RIENG\]/g, customReq);

    const resultArea = document.getElementById('generatedPrompt');

    if (resultArea) {
        resultArea.value = template;
        showToast('Đã tạo Prompt thành công!');
    }
}

/* =========================================================
   4. LOGIC TAB 2: QUẢN LÝ VÀ TÍNH TOÁN MA TRẬN CHI TIẾT
========================================================= */

function toggleAccordion(buttonEl) {
    const item = buttonEl.closest('.accordion-item');
    if (item) {
        item.classList.toggle('closed');
    }
}

function addMatrixRow(tableId, sectionType) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rowCount = tbody.children.length + 1;
    const tr = document.createElement('tr');

    if (sectionType === 2) {
        tr.innerHTML = `
            <td><input type="text" class="cell-stt" value="${rowCount}"></td>
            <td><input type="text" class="cell-sub" value="a"></td>
            <td><input type="text" class="cell-topic" value=""></td>
            <td class="text-center"><input type="checkbox" class="cell-nb" onclick="calculateMatrixTotals()"></td>
            <td class="text-center"><input type="checkbox" class="cell-th" onclick="calculateMatrixTotals()"></td>
            <td class="text-center"><input type="checkbox" class="cell-vd" onclick="calculateMatrixTotals()"></td>
            <td><input type="text" class="cell-desc" value=""></td>
            <td class="text-center"><button type="button" class="btn-del-row" onclick="deleteMatrixRow(this)">✕</button></td>
        `;
    } else {
        tr.innerHTML = `
            <td><input type="text" class="cell-stt" value="${rowCount}"></td>
            <td><input type="text" class="cell-topic" value=""></td>
            <td class="text-center"><input type="checkbox" class="cell-nb" onclick="calculateMatrixTotals()"></td>
            <td class="text-center"><input type="checkbox" class="cell-th" onclick="calculateMatrixTotals()"></td>
            <td class="text-center"><input type="checkbox" class="cell-vd" onclick="calculateMatrixTotals()"></td>
            <td><input type="text" class="cell-desc" value=""></td>
            <td class="text-center"><button type="button" class="btn-del-row" onclick="deleteMatrixRow(this)">✕</button></td>
        `;
    }

    tbody.appendChild(tr);
    calculateMatrixTotals();
}

function deleteMatrixRow(btn) {
    const tr = btn.closest('tr');
    if (tr) {
        tr.remove();
        calculateMatrixTotals();
    }
}

function calculateMatrixTotals() {
    const calcSection = (tableId) => {
        let nb = 0, th = 0, vd = 0;
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        rows.forEach(r => {
            if (r.querySelector('.cell-nb')?.checked) nb++;
            if (r.querySelector('.cell-th')?.checked) th++;
            if (r.querySelector('.cell-vd')?.checked) vd++;
        });
        return { nb, th, vd, total: nb + th + vd };
    };

    const s1 = calcSection('tableSection1');
    const s2 = calcSection('tableSection2');
    const s3 = calcSection('tableSection3');
    const s4 = calcSection('tableSection4');

    const updateSecUI = (prefix, data) => {
        document.getElementById(`${prefix}NB`).textContent = data.nb;
        document.getElementById(`${prefix}TH`).textContent = data.th;
        document.getElementById(`${prefix}VD`).textContent = data.vd;
        document.getElementById(`${prefix}Total`).textContent = data.total;
    };

    updateSecUI('sec1', s1);
    updateSecUI('sec2', s2);
    updateSecUI('sec3', s3);
    updateSecUI('sec4', s4);

    const grandNB = s1.nb + s2.nb + s3.nb + s4.nb;
    const grandTH = s1.th + s2.th + s3.th + s4.th;
    const grandVD = s1.vd + s2.vd + s3.vd + s4.vd;
    const grandTotal = s1.total + s2.total + s3.total + s4.total;

    document.getElementById('matrixGrandNB').textContent = grandNB;
    document.getElementById('matrixGrandTH').textContent = grandTH;
    document.getElementById('matrixGrandVD').textContent = grandVD;
    document.getElementById('matrixGrandTotal').textContent = grandTotal;
}

/* =========================================================
   5. TẢI FILE EXCEL MA TRẬN (MAU_MA_TRAN.XLSX)
========================================================= */

function downloadTemplateMatrix() {
    const filePath = "mau_ma_tran.xlsx";
    const link = document.createElement("a");
    link.href = filePath;
    link.download = "mau_ma_tran.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đang tải file ma trận mẫu...');
}

function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('excelFileName').textContent = `Đã chọn: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const numSheets = workbook.SheetNames.length;

            if (numSheets === 1) {
                parseExcelSheetToTable(workbook.Sheets[workbook.SheetNames[0]], 'tableSection1', 1);
                document.querySelectorAll('#tableSection2 tbody, #tableSection3 tbody, #tableSection4 tbody')
                        .forEach(tbody => tbody.innerHTML = '');
            } else {
                if (numSheets >= 1) parseExcelSheetToTable(workbook.Sheets[workbook.SheetNames[0]], 'tableSection1', 1);
                if (numSheets >= 2) parseExcelSheetToTable(workbook.Sheets[workbook.SheetNames[1]], 'tableSection2', 2);
                if (numSheets >= 3) parseExcelSheetToTable(workbook.Sheets[workbook.SheetNames[2]], 'tableSection3', 3);
                if (numSheets >= 4) parseExcelSheetToTable(workbook.Sheets[workbook.SheetNames[3]], 'tableSection4', 4);
            }

            calculateMatrixTotals();
            showToast('Đã tải ma trận từ Excel thành công!');
        } catch (err) {
            console.error('Lỗi đọc file Excel:', err);
            showToast('Lỗi đọc file Excel! Kiểm tra lại định dạng file.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseExcelSheetToTable(sheet, tableId, sectionType) {
    const table = document.getElementById(tableId);
    if (!table || !sheet) return;

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const rowStr = row.join(' ').toLowerCase();
        if (rowStr.includes('dạng thức') || rowStr.includes('thành phần năng lực') || rowStr.includes('phần')) continue;

        if (sectionType === 2) {
            const stt = row[1] || '';
            const sub = row[2] || '';
            const topic = row[3] || row[0] || '';
            const isNB = row[4] == '1' || row[4] == 'x' || row[4] == 'X';
            const isTH = row[5] == '1' || row[5] == 'x' || row[5] == 'X';
            const isVD = row[6] == '1' || row[6] == 'x' || row[6] == 'X';
            const desc = row[7] || row[6] || '';

            if (!stt && !sub && !topic && !desc) continue;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="cell-stt" value="${stt}"></td>
                <td><input type="text" class="cell-sub" value="${sub}"></td>
                <td><input type="text" class="cell-topic" value="${topic}"></td>
                <td class="text-center"><input type="checkbox" class="cell-nb" ${isNB ? 'checked' : ''} onclick="calculateMatrixTotals()"></td>
                <td class="text-center"><input type="checkbox" class="cell-th" ${isTH ? 'checked' : ''} onclick="calculateMatrixTotals()"></td>
                <td class="text-center"><input type="checkbox" class="cell-vd" ${isVD ? 'checked' : ''} onclick="calculateMatrixTotals()"></td>
                <td><input type="text" class="cell-desc" value="${desc}"></td>
                <td class="text-center"><button type="button" class="btn-del-row" onclick="deleteMatrixRow(this)">✕</button></td>
            `;
            tbody.appendChild(tr);
        } else {
            const stt = row[1] || row[0] || '';
            const topic = row[3] || row[2] || '';
            const isNB = row[4] == '1' || row[4] == 'x' || row[4] == 'X';
            const isTH = row[5] == '1' || row[5] == 'x' || row[5] == 'X';
            const isVD = row[6] == '1' || row[6] == 'x' || row[6] == 'X';
            const desc = row[7] || row[6] || '';

            if (!stt && !topic && !desc) continue;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="cell-stt" value="${stt}"></td>
                <td><input type="text" class="cell-topic" value="${topic}"></td>
                <td class="text-center"><input type="checkbox" class="cell-nb" ${isNB ? 'checked' : ''} onclick="calculateMatrixTotals()"></td>
                <td class="text-center"><input type="checkbox" class="cell-th" ${isTH ? 'checked' : ''} onclick="calculateMatrixTotals()"></td>
                <td class="text-center"><input type="checkbox" class="cell-vd" ${isVD ? 'checked' : ''} onclick="calculateMatrixTotals()"></td>
                <td><input type="text" class="cell-desc" value="${desc}"></td>
                <td class="text-center"><button type="button" class="btn-del-row" onclick="deleteMatrixRow(this)">✕</button></td>
            `;
            tbody.appendChild(tr);
        }
    }
}

/* =========================================================
   6. TẠO PROMPT THEO MA TRẬN (TAB 2)
========================================================= */

function generateMatrixPrompt() {
    let template = state.matrixPromptTemplate || DEFAULT_MATRIX_PROMPT;

    const subject = document.getElementById('matrixSubject')?.value || '[MON_HOC]';
    const grade = document.getElementById('matrixGrade')?.value || '[LOP]';
    const topic = document.getElementById('matrixTopic')?.value || '[CHU_DE]';

    template = template.replace(/\{MON_HOC\}/g, subject)
                       .replace(/\{LOP\}/g, grade)
                       .replace(/\{CHU_DE\}/g, topic);

    const formatTableText = (tableId, hasSub) => {
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        if (rows.length === 0) return '(Không có câu hỏi)';

        let text = '';
        rows.forEach((r, idx) => {
            const stt = r.querySelector('.cell-stt')?.value || (idx + 1);
            const topic = r.querySelector('.cell-topic')?.value || '';
            const isNB = r.querySelector('.cell-nb')?.checked ? 'Nhận biết' : '';
            const isTH = r.querySelector('.cell-th')?.checked ? 'Thông hiểu' : '';
            const isVD = r.querySelector('.cell-vd')?.checked ? 'Vận dụng' : '';
            const level = [isNB, isTH, isVD].filter(Boolean).join('/') || 'Chưa chọn';
            const desc = r.querySelector('.cell-desc')?.value || '';

            if (hasSub) {
                const sub = r.querySelector('.cell-sub')?.value || '';
                text += `+ Câu ${stt}, Ý ${sub}: Đơn vị kiến thức [${topic}] - Mức độ: [${level}] - Yêu cầu: ${desc}\n`;
            } else {
                text += `+ Câu ${stt}: Đơn vị kiến thức [${topic}] - Mức độ: [${level}] - Yêu cầu: ${desc}\n`;
            }
        });
        return text;
    };

    template = template.replace('{BANG_PHAN_1}', formatTableText('tableSection1', false))
                       .replace('{BANG_PHAN_2}', formatTableText('tableSection2', true))
                       .replace('{BANG_PHAN_3}', formatTableText('tableSection3', false))
                       .replace('{BANG_PHAN_4}', formatTableText('tableSection4', false));

    const resultArea = document.getElementById('generatedMatrixPrompt');
    if (resultArea) {
        resultArea.value = template;
        showToast('Đã tạo Prompt theo ma trận!');
    }
}

/* =========================================================
   7. XUẤT MA TRẬN NÀY RA FILE EXCEL (.XLSX)
========================================================= */

function exportMatrixToExcel() {
    if (typeof XLSX === 'undefined') {
        showToast('Thư viện XLSX chưa sẵn sàng!');
        return;
    }

    const wb = XLSX.utils.book_new();

    const getTableData = (tableId, hasSub) => {
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        const data = [];
        rows.forEach(r => {
            const stt = r.querySelector('.cell-stt')?.value || '';
            const topic = r.querySelector('.cell-topic')?.value || '';
            const nb = r.querySelector('.cell-nb')?.checked ? 'X' : '';
            const th = r.querySelector('.cell-th')?.checked ? 'X' : '';
            const vd = r.querySelector('.cell-vd')?.checked ? 'X' : '';
            const desc = r.querySelector('.cell-desc')?.value || '';

            if (hasSub) {
                const sub = r.querySelector('.cell-sub')?.value || '';
                data.push({ "STT": stt, "Ý": sub, "Đơn vị kiến thức": topic, "NB": nb, "TH": th, "VD": vd, "Mô tả yêu cầu": desc });
            } else {
                data.push({ "STT": stt, "Đơn vị kiến thức": topic, "NB": nb, "TH": th, "VD": vd, "Mô tả yêu cầu": desc });
            }
        });
        return data;
    };

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getTableData('tableSection1', false)), "Phan 1");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getTableData('tableSection2', true)), "Phan 2");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getTableData('tableSection3', false)), "Phan 3");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getTableData('tableSection4', false)), "Phan 4");

    XLSX.writeFile(wb, "Ma_tran_de_thi.xlsx");
    showToast('Đã tải file Excel ma trận!');
}

/* =========================================================
   8. THẺ 3: LOGIC TẠO MA TRẬN ĐẶC TẢ (ĐỌC TỪ default_prompt3.txt)
========================================================= */

function addTopicRow() {
    const tbody = document.querySelector('#topicWeightTable tbody');
    if (!tbody) return;

    const rowCount = tbody.children.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="cell-topic-stt" value="${rowCount}"></td>
        <td><input type="text" class="cell-topic-name" value=""></td>
        <td><input type="text" class="cell-topic-weight" value=""></td>
        <td><input type="text" class="cell-topic-note" value=""></td>
        <td class="text-center"><button type="button" class="btn-del-row" onclick="deleteTopicRow(this)">✕</button></td>
    `;
    tbody.appendChild(tr);
}

function deleteTopicRow(btn) {
    const tr = btn.closest('tr');
    if (tr) tr.remove();
}

function generateBuildMatrixPrompt() {
    let template = state.buildMatrixPromptTemplate;

    if (!template) {
        showToast('Đang tải prompt mẫu 3 hoặc không tìm thấy file default_prompt3.txt!');
        return;
    }

    const subject = document.getElementById('genMatrixSubject')?.value || '[MON_HOC]';
    const grade = document.getElementById('genMatrixGrade')?.value || '[LOP]';
    const time = document.getElementById('genMatrixTime')?.value || '[THOI_GIAN]';
    const format = document.getElementById('genMatrixFormat')?.value || 'Tự do phân bổ';

    const rows = document.querySelectorAll('#topicWeightTable tbody tr');
    let topicListText = '';

    rows.forEach((r, idx) => {
        const name = r.querySelector('.cell-topic-name')?.value || '';
        const weight = r.querySelector('.cell-topic-weight')?.value || '';
        const note = r.querySelector('.cell-topic-note')?.value || '';

        if (name) {
            topicListText += `${idx + 1}. Chủ đề: "${name}" - Bố cục điểm/Tỷ lệ: [${weight}] - Ghi chú trọng tâm: ${note}\n`;
        }
    });

    if (!topicListText) {
        topicListText = '(Giáo viên chưa nhập chủ đề chi tiết)';
    }

    template = template.replace(/\{MON_HOC\}/g, subject)
                       .replace(/\{LOP\}/g, grade)
                       .replace(/\{THOI_GIAN\}/g, time)
                       .replace(/\{CAU_TRUC\}/g, format)
                       .replace(/\{DANH_SACH_CHU_DE\}/g, topicListText);

    const resultArea = document.getElementById('generatedBuildMatrixPrompt');
    if (resultArea) {
        resultArea.value = template;
        showToast('Đã tạo Prompt thành công!');
    }
}
/* =========================================================
   9. EVENT LISTENERS
========================================================= */

function setupEventListeners() {
    // Tab 1 Events
    document.getElementById('generatePromptBtn')?.addEventListener('click', generateNoMatrixPrompt);
    document.getElementById('copyPromptBtn')?.addEventListener('click', () => {
        const txt = document.getElementById('generatedPrompt')?.value;
        if (txt) { navigator.clipboard.writeText(txt); showToast('Đã sao chép prompt!'); }
    });

// Lưu / Import cấu hình Thẻ 1
document.getElementById('saveTab1ConfigBtn')
    ?.addEventListener('click', saveTab1Config);

document.getElementById('importTab1ConfigFile')
    ?.addEventListener('change', importTab1Config);

    document.getElementById('clearResultBtn')?.addEventListener('click', () => {
        const res = document.getElementById('generatedPrompt');
        if (res) res.value = '';
    });

	const matrixInputs = document.querySelectorAll(
		'.matrix-input, #enableMCQ, #enableTF, #enableShort, #enableFill, #enableSort'
	);
    matrixInputs.forEach(input => input.addEventListener('input', updateNoMatrixTotals));

    // Tab 2 Events
    document.getElementById('excelMatrixFile')?.addEventListener('change', handleExcelUpload);
    document.getElementById('generateMatrixPromptBtn')?.addEventListener('click', generateMatrixPrompt);
    document.getElementById('exportMatrixExcelBtn')?.addEventListener('click', exportMatrixToExcel);
    document.getElementById('copyMatrixPromptBtn')?.addEventListener('click', () => {
        const txt = document.getElementById('generatedMatrixPrompt')?.value;
        if (txt) { navigator.clipboard.writeText(txt); showToast('Đã sao chép prompt!'); }
    });
    document.getElementById('clearMatrixResultBtn')?.addEventListener('click', () => {
        const res = document.getElementById('generatedMatrixPrompt');
        if (res) res.value = '';
    });

    // Tab 3 Events
    document.getElementById('generateBuildMatrixPromptBtn')?.addEventListener('click', generateBuildMatrixPrompt);
    document.getElementById('copyGenMatrixPromptBtn')?.addEventListener('click', () => {
        const txt = document.getElementById('generatedBuildMatrixPrompt')?.value;
        if (txt) { 
            navigator.clipboard.writeText(txt); 
            showToast('Đã sao chép prompt tạo ma trận!'); 
        }
    });
    document.getElementById('clearGenMatrixResultBtn')?.addEventListener('click', () => {
        const res = document.getElementById('generatedBuildMatrixPrompt');
        if (res) res.value = '';
    });

    // Toggle Advanced Section
    document.getElementById('advancedToggle')?.addEventListener('click', function () {
        this.classList.toggle('open');
        const content = document.getElementById('advancedContent');
        if (content) content.classList.toggle('hidden');
    });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}