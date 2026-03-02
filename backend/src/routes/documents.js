const express = require("express");
const multer  = require("multer");
const { uploadDocument, getDocuments, deleteDocument } = require("../controllers/documentController");

const router  = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/json",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Use PDF, TXT, MD or JSON"));
    }
  },
});

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/",        getDocuments);
router.delete("/:documentId", deleteDocument);

module.exports = router;