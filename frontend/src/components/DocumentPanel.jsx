import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Trash2, FileText, Upload, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDocuments, uploadDocument, deleteDocument } from '../utils/api';

const formatSize = (b) =>
  b < 1024 ? b + ' B' : b < 1048576
  ? (b/1024).toFixed(1) + ' KB'
  : (b/1048576).toFixed(1) + ' MB';

export default function DocumentPanel() {
  const [docs, setDocs]           = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchDocs(); }, []);

  useEffect(() => {
    if (!docs.some((d) => d.status === 'processing')) return;
    const t = setInterval(fetchDocs, 3000);
    return () => clearInterval(t);
  }, [docs]);

  const fetchDocs = async () => {
    try { const r = await getDocuments(); setDocs(r.data); } catch {}
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await uploadDocument(file);
      toast.success(`uploaded: ${file.name}`);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id, name) => {
    await deleteDocument(id);
    setDocs((p) => p.filter((d) => d.documentId !== id));
    toast.success(`deleted: ${name}`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleUpload(files[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain':      ['.txt'],
      'text/markdown':   ['.md'],
      'application/json':['.json'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="w-72 bg-black border-l border-white/10 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen size={14} className="text-[#00ff88]" />
          <h3 className="text-white/50 font-mono text-xs uppercase tracking-widest">
            documents
          </h3>
        </div>

        {/* Dropzone */}
        <div {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-5 text-center
          cursor-pointer transition-all
          ${isDragActive
            ? 'border-[#00ff88] bg-[#00ff88]/10'
            : 'border-white/10 hover:border-[#00ff88]/40 hover:bg-[#00ff88]/5'
          }`}>
          <input {...getInputProps()} />
          <Upload size={20} className={`mx-auto mb-2 transition-colors
            ${isDragActive ? 'text-[#00ff88]' : 'text-white/20'}`} />
          <p className="text-white/30 text-xs font-mono leading-relaxed">
            {uploading ? '// uploading...' : isDragActive
              ? '// drop_file()' : '// drop_file_or_click()'}
          </p>
          <p className="text-white/15 text-xs mt-1 font-mono">
            pdf · txt · md · json · 10mb
          </p>
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {docs.length === 0 ? (
          <p className="text-center text-white/15 text-xs mt-8 font-mono">
            // no documents yet
          </p>
        ) : docs.map((doc) => (
          <div key={doc.documentId}
            className="bg-white/5 border border-white/10 hover:border-[#00ff88]/20
            rounded-xl p-3 flex items-center gap-3 transition-all group">
            <div className="w-9 h-9 bg-[#00ff88]/10 border border-[#00ff88]/20
            rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={15} className="text-[#00ff88]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-mono font-medium truncate">
                {doc.name}
              </p>
              <p className="text-white/25 text-xs font-mono">{formatSize(doc.size)}</p>
              <span className={`text-xs font-mono font-medium
                ${doc.status === 'ready'      ? 'text-[#00ff88]' : ''}
                ${doc.status === 'processing' ? 'text-yellow-400' : ''}
                ${doc.status === 'error'      ? 'text-red-400'   : ''}`}>
                {doc.status === 'ready'      && '✓ ready'}
                {doc.status === 'processing' && '⏳ processing...'}
                {doc.status === 'error'      && '✗ error'}
              </span>
            </div>
            <button onClick={() => handleDelete(doc.documentId, doc.name)}
              className="opacity-0 group-hover:opacity-100 text-white/20
              hover:text-red-400 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}