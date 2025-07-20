interface Props {
  error: string | null;
  onClose: () => void;
}

export const ErrorDisplay = ({ error, onClose }: Props) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={onClose}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};