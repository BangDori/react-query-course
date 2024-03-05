## Table of Contents

1. [Introduction to Mutations and Mutations Global Settings - Review](#introduction-to-mutations-and-mutations-global-settings---review)
2. [Custom Mutation Hook: useReserveAppointments - Review](#custom-mutation-hook-usereserveappointments---review)
3. [Invalidating Query after Mutation - Review](#invalidating-query-after-mutation---review)

## Introduction to Mutations and Mutations Global Settings - Review

- Issue: [#40](https://github.com/BangDori/react-query-course/issues/40)

mutation을 사용할 때도, query를 사용할때와 유사한 방법으로 error와 loading indicator를 설정할 수 있다.

우선 loading indicator부터 살펴보자. 기존에 useQuery를 사용할 때는 loading indicator를 중앙에서 관리하기 위해 `useIsFetching` 메서드를 사용하여 관리하였다. 근데, mutation에도 중앙에서 관리하기 위한 메서드가 존재한다. 바로 `useIsMutating`이다. 아래는 `useIsMutating`을 통해 서버에 상태를 업데이트 하는 중인지를 확인하고 있다.

```tsx
import { Spinner, Text } from "@chakra-ui/react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function Loading() {
  // use React Query `useIsFetching` to determine whether or not to display
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const display = isFetching || isMutating ? "inherit" : "none";

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

`useIsFetching`과 `useIsMutating` 상태를 둘 다 추적하여, 둘 중 하나라도 True상태라면 로딩 스피너를 표시하는 컴포넌트이다.

그럼 다음으로, 에러를 살펴보자. 에러 설정 또한 query를 사용할 때와 유사한 방법으로 설정할 수 있다. query에 대한 에러를 처리하기 위해, 다음과 같이 queryClient에 queryCache를 추가하여 errorHandling 기능을 구현하였다.

```typescript
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Error Handling
    },
  }),
});
```

mutation에 대한 에러는 query가 아닌 mutation으로 이름을 변경하여 똑같이 적용해줄 수 있다.

```typescript
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Error Handling
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Error Handling
    },
  }),
});
```

## Custom Mutation Hook: useReserveAppointments - Review

- Issue: [#41](https://github.com/BangDori/react-query-course/issues/41)

`useMutation`은 `useQuery`와 매우 유사하다. 하지만 mutation은 [intro to mutations](https://github.com/BangDori/react-query-course/blob/main/section/section-2.md#intro-to-mutations---review)에서도 설명했듯이, 서버 상태를 가져오고 관리하는 것이 아닌, 서버에 데이터를 변화시키기 위해 네트워크 요청을 만들어내는 것이므로 다음과 같은 차이점이 존재한다.

1. `useMutation`은 한 번만 발생하기 때문에 cach data가 존재하지 않는다.
   - mutation의 경우 서버의 데이터를 변경하기 위해 사용하는 것으로, mutationKey를 주로 작성하고 사용하지 않는다.
   - mutationKey를 사용하는 경우는 언제일까? [#]
2. 네트워크 재요청을 하지 않는다.
   - 물론 `useMutation` 내에서 retry를 설정할 수는 있다. (default = 0)
3. 다시 받아오는 refetch가 없다.
4. isLoading, isFetching이 없다
5. mutation을 수행할 수 있는 함수를 반환한다.
6. 최적화된 쿼리를 위한 유용한 onMutate 콜백을 제공한다.

`useMutation`의 경우 각 mutation이 성공했는지, 실패했는지 그리고 완료되었는지를 콜백 메서드로 처리할 수 있도록 기능을 제공해주고 있다.

1. onSuccess
2. onError
3. onSettled

- reference: https://tanstack.com/query/latest/docs/framework/react/reference/useMutation

## Invalidating Query after Mutation - Review

- Issue: [#42](https://github.com/BangDori/react-query-course/issues/42)

```typescript
const { mutate } = useMutation({
  mutationFn: (appointment: Appointment) =>
    setAppointmentUser(appointment, userId),
  onSuccess: () => {
    toast({ title: "You have reserved an appointment!", status: "success" });
  },
});
```

mutate 메서드를 사용하여 서버에 업데이트를 하더라도, mutation 이후에 자동적으로 페이지가 업데이트되지 않는 문제가 있었다. 이걸 어떻게 해결해야할까?

mutation이 캐시에 저장된 appointments를 무효화하고, re-fetch를 동작시키면 해결할 수 있다. 시나리오는 다음과 같다.

1. mutate
2. onSuccess => invalidateQueries
3. active query => refetch

queryClient를 활용하여 invalidateQueries를 적용해자.

```typescript
const { mutate } = useMutation({
  mutationFn: (appointment: Appointment) =>
    setAppointmentUser(appointment, userId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.appointments] });
    toast({ title: "You have reserved an appointment!", status: "success" });
  },
});
```

## Intro to Optimistic Updates in React Query

- Issue: [#44](https://github.com/BangDori/react-query-course/issues/44)

### Optimistic Updates

- mutate 메서드를 통해 서버에 업데이트 정보를 전달하고, 다시 refetch하기 까지는 시간이 걸리게 되고, 즉각적인 반응이 처리되지 않아 UX를 저하할 수 있다. 그럼 이를 어떻게 처리해야할까?
  - 이를 해결하기 위해 우리는 Optimistic Updates를 구현할 수 있다.

우선 굉장히 복잡하고, 컨트롤할 게 많은데 한 번 해보자.

- 이전 서버 데이터가 업데이트를 덮어쓰지 않도록 진행 중인 쿼리를 취소해야 한다.
- 롤백을 위해 데이터를 저장해야 한다.
- 업데이트가 실해가데 된다면, 명시적으로 롤백을 처리해야 한다.

### Optimistic Updates: UI

React Query에서는 위 방법을 꽤나 간단하게 구현할 수 있도록 기능을 제공해준다.

그 기능이 useMutationState를 통해 mutation 데이터를 받아오는 것이다. mutation 키가 mutation 데이터를 확인한다. 그리고 mutation이 pending중일 때, 페이지에 데이터를 보여준다.

mutatoin이 settled, 즉 완료된 이후 쿼리가 무효화 되고, 데이터를 다시 받아온다. 이 과정에서 mutation이 실패한다면 데이터가 롤백 될 것이고, 그렇지 않다면 서버로부터 교체되어질 것이다.
