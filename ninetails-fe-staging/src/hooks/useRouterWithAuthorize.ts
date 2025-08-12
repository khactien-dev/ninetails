import { useRouter } from 'next/router';

export const useRouterWithAuthorize = () => {
  const router = useRouter();

  const getPath = (rawPath: string, rawQuery = {}) => {
    if (router?.isReady) {
      const opId = router?.query.opId;
      const schema = router?.query.schema;
      const queryObject =
        opId && schema
          ? {
              ...rawQuery,
              opId,
              schema,
            }
          : rawQuery;

      const queryParams = new URLSearchParams(queryObject);
      return `${rawPath}?${queryParams?.toString()}`;
    }
    return rawPath;
  };

  const pushWithAuthorize = (rawPath: string, rawQuery = {}) => {
    const opId = router?.query.opId;
    const schema = router?.query.schema;

    const queryObject =
      opId && schema
        ? {
            ...rawQuery,
            opId,
            schema,
          }
        : rawQuery;

    router.push({
      pathname: rawPath,
      query: queryObject,
    });
  };

  return {
    ...router,
    getPath,
    pushWithAuthorize,
  };
};
