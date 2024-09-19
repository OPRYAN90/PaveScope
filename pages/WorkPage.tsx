// pages/workpage.tsx
import { withAuth } from '../lib/withAuth';

function WorkPage() {
  // Your component logic here
}

export const getServerSideProps = withAuth(async (context) => {
  // Fetch any necessary data here
  return { props: {} };
});

export default WorkPage;