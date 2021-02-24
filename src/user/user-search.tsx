import { Button, InputGroup } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import { SectionLayout } from "../layout/section-layout";
import { useSearchUsers } from "../octokit/search-user";

export const UserSearch = () => {
  const [query, setQuery] = useState("grancalavera");

  const { data, remove, refetch } = useSearchUsers(
    { q: query, per_page: 2 },
    { enabled: !!query, staleTime: 0 }
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    query && refetch();
  }, [query, refetch]);

  const clear = () => {
    setQuery("");
    remove();
    inputRef.current?.focus();
  };

  const rightElement = <Button icon="cross" minimal disabled={!query} onClick={clear} />;

  const search = (
    <InputGroup
      onChange={(e) => setQuery(e.target.value)}
      {...{ rightElement, inputRef, value: query }}
    ></InputGroup>
  );

  return (
    <SectionLayout header={search}>
      {data && (
        <>
          <pre>Total Count: {data?.data.total_count}</pre>
          <pre>Incomplete Results: {data?.data.incomplete_results}</pre>
          <pre>{JSON.stringify(data?.data.items, null, 2)}</pre>
        </>
      )}
    </SectionLayout>
  );
};
