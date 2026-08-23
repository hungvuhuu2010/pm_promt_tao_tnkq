<!-- KẾT QUẢ PROMPT TẠO MA TRẬN -->
<section class="card result-section" id="genMatrixResultSection">
    <div class="section-title">
        <div class="section-number">3</div>
        <div>
            <h2>Prompt yêu cầu AI điền vào Ma trận mẫu</h2>
            <p>Copy prompt này, <strong>đính kèm file Excel ma trận mẫu (ví dụ: mau_ma_tran.xlsx hoặc mau_ma_tran_2.xlsx)</strong> và gửi cho ChatGPT / Gemini / Claude.</p>
        </div>
    </div>

    <div class="prompt-toolbar">
        <button type="button" class="button success" id="copyGenMatrixPromptBtn">Sao chép prompt</button>
        <button type="button" class="button error" id="clearGenMatrixResultBtn">Xóa</button>
        <button type="button" class="button secondary" onclick="downloadTemplateMatrix()">⬇ Tải file ma trận mẫu (.xlsx)</button>
    </div>

    <div class="form-group">
        <textarea id="generatedBuildMatrixPrompt" rows="8" readonly placeholder="Prompt tạo ma trận sẽ xuất hiện ở đây..."></textarea>
    </div>
</section>
