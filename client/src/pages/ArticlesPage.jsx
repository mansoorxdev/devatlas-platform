import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';

export function ArticlesPage() {
  return (
    <>
      <Helmet>
        <title>Articles - DevAtlas</title>
      </Helmet>
      <Container className="flex-grow flex items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-500">Articles Module (Coming Soon)</h2>
      </Container>
    </>
  );
}

export default ArticlesPage;
