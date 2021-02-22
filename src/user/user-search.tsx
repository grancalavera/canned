import { Button, InputGroup } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce/lib";
import { SectionLayout } from "../layout/section-layout";
import { useSearchUsers } from "../octokit/search-user";

export const UserSearch = () => {
  const [value, setValue] = useState("");
  const [query] = useDebounce(value, 500);
  const { data, remove } = useSearchUsers(
    { q: query },
    { enabled: !!query, staleTime: 0 }
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!value) {
      inputRef.current?.focus();
      remove();
    }
  }, [value, remove]);

  useEffect(() => {
    console.log("query", query);
  }, [query]);

  useEffect(() => {
    console.log("value", value);
  }, [value]);

  const rightElement = (
    <Button icon="cross" minimal disabled={!value} onClick={() => setValue("")} />
  );

  const search = (
    <InputGroup
      onChange={(e) => setValue(e.target.value)}
      {...{ rightElement, inputRef, value }}
    ></InputGroup>
  );

  return (
    <SectionLayout header={search}>
      {data && (
        <>
          <pre>Total Count: {data?.data.total_count}</pre>
          <pre>Incomplete Results: {data?.data.incomplete_results}</pre>
          <pre style={{ overflowX: "hidden" }}>
            {JSON.stringify(data?.data.items, null, 2)}
          </pre>
        </>
      )}
    </SectionLayout>
  );
};
