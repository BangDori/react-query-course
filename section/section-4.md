## Table of Contents

1. [Centralized Fetching indicator with useIsFetching - Review](#centralized-fetching-indicator-with-useisfetching---review)
2. [onError Default for Query Client - Review](#onerror-default-for-query-client---review)
3. [스스로하는 Q&A](#스스로하는-qa)

## Centralized Fetching indicator with useIsFetching - Review

기존에 어플리케이션 규모가 작은 경우에, 즉 서버로부터 받아온 데이터의 상태를 관리가 크게 필요하지 않은 경우에는 해당 컴포넌트에서 `useQuery`를 선언하고, `isLoading`을 통해 Loading indicator를 표시하였다.

하지만 어플리케이션의 규모가 커짐에 따라, 컴포넌트에서 Loading indicator를 표시해줘야 하는 상황이 많아지게 되는데 모든 컴포넌트에서 `useQuery`를 선언하고, `isLoading`을 통해 관리하는 부분에 대한 중복이 개발자를 피곤하게 만들었다.

이에, 모든 Loading 상태를 한 곳에서 관리할 수 있도록 React Query에서는 `useIsFetching` 이라는 hooks를 제공하고 있다. `useIsFetching`을 통해 하나의 컴포넌트에서 상태를 관리할 수 있다.

아래는 `useIsFetching`을 활용하여 로딩 상태에 맞춰 Loading indicator를 표시하는 컴포넌트이다.

```tsx
import { Spinner, Text } from "@chakra-ui/react";
import { useIsFetching } from "@tanstack/react-query";

export function Loading() {
  // use React Query `useIsFetching` to determine whether or not to display
  const isFetching = useIsFetching();
  const display = isFetching ? "inherit" : "none";

  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}
```

Loading 컴포넌트에서 `useIsFetching`을 통해 React Query가 fetching 중인 정보가 있는지를 중앙에서 확인한다.

이렇게 함으로써, 모든 컴포넌트에서 `isLoading` 상태를 추적하고 표시하는 것이 아닌 해당 컴포넌트를 불러와 사용할 수 있어 React의 철학인 재사용에 집중할 수 있다.

## onError Default for Query Client - Review

React Query에서는 모든 Loading 상태를 추적해주는, `useIsFetching` hooks를 제공해주고 있지만, error를 추적해주는 hooks는 없다. 그렇다면 어떻게 error를 중앙에서 관리할 수 있도록 할 수 있을까?

바로, QueryCache에서 onError Callback을 설정하는 방법이다. tanstack/react-query 라이브러리에서 [QueryCache](https://tanstack.com/query/v4/docs/reference/QueryCache)에 대한 문서를 확인해보자. QueryCache를 통해 `onSuccess`, `onError`, `onSettled` 등을 활용할 수 있다.

다음과 같이 QueryCache를 QueryClient 속성에 추가해서 에러가 발생한 경우 핸들링할 수 있다.

```typescript
function errorHandler(errorMsg: string) {
  const id = "react-query-toast";

  if (!toast.isActive(id)) {
    const action = "fetch";
    const title = `could not ${action} data: ${
      errorMsg ?? "error connecting to server"
    }`;
    toast({ id, title, status: "error", variant: "subtle", isClosable: true });
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => errorHandler(error.message),
  }),
});
```

위 방식으로 QueryClient 속성에 queryCache를 추가하여, errorHandling 함수를 적용할 수 있다. 이렇게 하면 에러가 발생했을 때 errorMessage가 errorHandler 함수로 전달되게 되고 에러 메시지가 toast로 화면 하단에 표시되게 된다.

## 스스로하는 Q&A

#### 1. useIsFetching의 반환 값은 왜 Boolean 타입이 아닌 Number 타입일까?

여기서 tanstack/react-query에서 제공해주는 [useIsFetching](https://tanstack.com/query/v4/docs/framework/react/reference/useIsFetching)에 대한 문서를 참고해보면, `useIsFetching`은 `Boolean` 타입의 값을 반환하는 것이 아닌 숫자를 반환한다는 것을 알 수 있다.

문서를 살펴보면, 이러한 코드 예시가 있는 것을 확인할 수 있다.

```tsx
import { useIsFetching } from "@tanstack/react-query";
// How many queries are fetching?
const isFetching = useIsFetching();
// How many queries matching the posts prefix are fetching?
const isFetchingPosts = useIsFetching({ queryKey: ["posts"] });
```

즉, `useIsFetching`은 현재 몇 개의 query를 fetching 하고 있는 중인지를 나타내는 숫자인 것이다.

#### 2. 그렇다면 각기 다른 쿼리에 대한 로딩 상태를 분리하여야 한다면 어떻게 해야할까?

예를 들어 posts, comments, people 등 수 많은 쿼리가 존재하고, 이에 대한 로딩 상태를 관리하여야 한다고 가정해보자. 이때 posts와 comments는 동일한 로딩 상태로 관리할 수 있고, people은 독립적인 로딩 상태를 가져야한다고 하면 `useIsFetching`을 활용하여 다음과 같이 사용할 수 있다.

```typescript
const isFetchingPostsAndComments = useIsFetching({
  queryKey: ["posts", "comments"],
});
const isFetchingPeople = useIsFetching({ queryKey: ["people"] });
```

이렇게 각각 분리함으로써, posts와 comments를 그룹화하여 fetching 상태를 관리할 수 있고, people query에 대해서만 fetching 상태를 관리할 수 있다.
