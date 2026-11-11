import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { parseRoute, type Route } from './routes';
import { TabBar } from './components/TabBar';
import { LangRoot } from './components/LangRoot';
import { LangSwitch } from './components/LangSwitch';
import { useLang } from './i18n/LangContext';
import { QuestScreen } from './screens/QuestScreen';
import { FormScreen } from './screens/FormScreen';
import { PayslipScreen } from './screens/PayslipScreen';
import { CardsScreen } from './screens/CardsScreen';
import { GlossaryScreen } from './screens/GlossaryScreen';
import { HelpScreen } from './screens/HelpScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { WorkScreen } from './screens/WorkScreen';
import { DeadlineScreen } from './screens/DeadlineScreen';
import { PassportScreen } from './screens/PassportScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { TermsScreen } from './screens/TermsScreen';
import { DeadlineBanner } from './deadline/DeadlineBanner';
import { Icon } from './components/Icon';
import { plain } from './components/text';
import { PwaUpdate } from './pwa/PwaUpdate';
import { InstallHint } from './pwa/InstallHint';
import { ExpiredPhotosPrompt } from './worklog/photos/ui/ExpiredPhotosPrompt';
import { BackupReminder } from './backup/ui/BackupReminder';

function renderScreen(route: Route): JSX.Element {
  switch (route) {
    case 'form':
      return <FormScreen />;
    case 'payslip':
      return <PayslipScreen />;
    case 'cards':
      return <CardsScreen />;
    case 'glossary':
      return <GlossaryScreen />;
    case 'help':
      return <HelpScreen />;
    case 'tools':
      return <ToolsScreen />;
    case 'work':
      return <WorkScreen />;
    case 'deadline':
      return <DeadlineScreen />;
    case 'passport':
      return <PassportScreen />;
    case 'privacy':
      return <PrivacyScreen />;
    case 'terms':
      return <TermsScreen />;
    case 'quest':
    default:
      return <QuestScreen />;
  }
}

function Shell(): JSX.Element {
  const { ui } = useLang();
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = (): void => {
      setRoute(parseRoute(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <>
      <header data-testid="app-header" className="app-header">
        <a href="#/" className="app-brand" data-testid="app-brand" aria-label="Korea30">
          Korea<b>30</b>
        </a>
        <div className="app-header-actions">
          <LangSwitch />
          <a href="#/help" className="app-help" data-testid="nav-help" aria-label={plain(ui.appHelp)} title={plain(ui.appHelp)}>
            <Icon name="phone" size={19} />
          </a>
        </div>
      </header>
      <DeadlineBanner />
      <ExpiredPhotosPrompt />
      <BackupReminder />
      {route === 'quest' ? <InstallHint /> : null}
      {import.meta.env.PROD ? <PwaUpdate /> : null}
      {renderScreen(route)}
      <TabBar current={route} />
    </>
  );
}

export default function App(): JSX.Element {
  return (
    <LangRoot>
      <Shell />
    </LangRoot>
  );
}
