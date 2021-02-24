import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "./error/error-boundary";
import { UserSearch } from "./user/user-search";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <UserSearch></UserSearch>
        <ReactQueryDevtools />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// const SearchUser = () => {
//   const [q, setQ] = useState("leon");
//   const query = useSearchUsers({ q }, { enabled: !!q });
//   const result = query.data?.data.items ?? [];
//   return (
//     <ul>
//       {result.map(({ id, login, html_url }) => (
//         <li key={id}>
//           <a href={html_url}>{login}</a>
//         </li>
//       ))}
//     </ul>
//   );
// };
