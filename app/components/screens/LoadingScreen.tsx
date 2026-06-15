'use client';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = '잠시만요' }: LoadingScreenProps) {
  return (
    <div className="screen active" id="screen-loading" style={{ background: 'var(--bg)' }}>
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="loading">
        <div className="loading-bar"></div>
        <div className="loading-title">트렌드를 모으고 있어요</div>
        <div className="loading-msg" id="loading-msg">{message}</div>
      </div>
    </div>
  );
}
