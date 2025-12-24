import { ConfigProvider } from 'antd';
import './App.css';
import PaperView from './pages/PaperView';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1f5eff',
          colorInfo: '#1f5eff',
          colorSuccess: '#16a34a',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 14,
          controlHeight: 40,
          fontFamily:
            "'Plus Jakarta Sans', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <PaperView />
    </ConfigProvider>
  );
}
