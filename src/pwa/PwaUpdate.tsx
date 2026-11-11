import type { JSX } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { UpdateNotice } from './UpdateNotice';

/** 서비스워커 등록(registerType prompt). 업데이트가 대기하면 UpdateNotice */
export function PwaUpdate(): JSX.Element | null {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisterError: () => {} });

  if (!needRefresh) return null;
  return (
    <UpdateNotice
      onReload={() => {
        void updateServiceWorker(true);
      }}
      onClose={() => setNeedRefresh(false)}
    />
  );
}
