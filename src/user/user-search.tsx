import { Button, InputGroup, NonIdealState } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import { SectionLayout } from "../layout/section-layout";
import { useSearchUsers } from "../octokit/search-user";

export const UserSearch = () => {
  const [query, setQuery] = useState("");

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

  const header = (
    <InputGroup
      placeholder="Search users"
      onChange={(e) => setQuery(e.target.value)}
      {...{ rightElement, inputRef, value: query }}
    ></InputGroup>
  );

  return (
    <SectionLayout header={header}>
      {data?.data.total_count ? (
        <>
          <pre>Total Count: {data?.data.total_count}</pre>
          <pre>Incomplete Results: {data?.data.incomplete_results}</pre>
          <pre>{JSON.stringify(data?.data.items, null, 2)}</pre>
        </>
      ) : (
        <NonIdealState
          icon="search"
          title={query ? "No search results" : "User search"}
          description={
            query ? (
              <>
                Your search didn't match any user.
                <br /> Try something different."
              </>
            ) : (
              "Search users by username or name."
            )
          }
        />
      )}
    </SectionLayout>
  );
};
