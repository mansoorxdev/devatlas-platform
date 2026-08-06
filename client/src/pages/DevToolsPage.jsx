import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';

export function DevToolsPage() {
  return (
    <>
      <Helmet>
        <title>Developer Tools - DevAtlas</title>
      </Helmet>
      <Container className="flex-grow flex items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-500">DevTools Module (Coming Soon)</h2>
      </Container>
    </>
  );
}

export default DevToolsPage;
