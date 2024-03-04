## Table of Contents

1. [Filtering Data with the useQuery select Option - Review](#filtering-data-with-the-usequery-select-option---review)
2. [Intro to Re-Fetch - Review](#intro-to-re-fetch---review)

## Filtering Data with the useQuery select Option - Review

- Issue: [#31](https://github.com/BangDori/react-query-course/issues/31)

React Query에서는 불필요한 연산을 줄이는 최적화를 진행하는데, 이를 메모이제이션(memoization)이라고 합니다.

- React Query는 Select Function을 삼중 등호(`===`)로 비교합니다.
- Select Function은 데이터와 함수가 모두 변경되었을 경우에만 실행됩니다. 그렇기에 마지막으로 검색한 데이터가 동일한 데이터이고, Select Function에 변동이 없으면 Select Function을 재실행하지 않는 것이 React Query에서의 최적화

- 그렇기에, 매번 변경되는 함수가 아닌 함수의 주소가 고정되어 있는 안정적인(stable) 함수가 필요로 합니다. 매번 바뀌는 익명 함수의 경우 삼중 등호로 비교하면 매번 다르기 때문에, 익명 함수로 만들고 싶다면 `useCallback` 메서드를 사용할 수 있습니다.

우리는 백엔드가 제공하는 구조 그대로 화면에 렌더링하지 않고 가공을 한 이후에 렌더링을 진행합니다. 근데 여기서 어떻게 반환하는 것이 좋을까요?

물론 제일 좋은 방법은 백엔드에서 진행하고 클라이언트로 원하는 데이터 구조를 그대로 준다면, 더할나위 없이 좋습니다. 하지만 모든 상황에서 백엔드를 통제할 수 있는 것은 아니기 때문에 우리는 데이터를 변환해야 하는 일련의 과정을 거쳐야 합니다.

그렇다면 어떻게 변환 과정을 거쳐야 할까요?

### 1. queryFn에서 진행

```typescript
const fetchTodos = async (): Promise<Todos> => {
  const response = await axios.get("todos");
  const data: Todos = response.data;

  return data.map((todo) => todo.name.toUpperCase());
};

export const useTodosQuery = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });
```

클라이언트에서는, 이 데이터를 "마치 백엔드에서 보내준 것 처럼" 활용할 수 있습니다. 하지만 이 구조에는 공간 배치 관점에서 백엔드와 가깝다는 장점이 있지만, 변환된 구조가 캐시에 저장되므로 원본 구조에 접근할 수 없습니다.

또한, 데이터를 불러올 때마다 실행되며 자유롭게 조작할 수 없는 공유 api 레이어가 있다면 실현이 불가능하다는 점이 있습니다.

### 2. 렌더링 함수에서 진행

커스텀 훅을 만든다면 내부에서 변환을 진행할 수 있습니다.

```typescript
const fetchTodos = async (): Promise<Todos> => {
  const response = await axios.get("todos");
  return response.data;
};

export const useTodosQuery = () => {
  const queryInfo = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  return {
    ...queryInfo,
    data: queryInfo.data?.map((todo) => todo.name.toUpperCase()),
  };
};
```

이 방법은 fetch 함수가 실행될 때 뿐만 아니라, 렌더링 할 때마다 실행됩니다. 일반적으로 문제되는 부분은 없지만, useMemo를 통해 다음과 같이 데이터를 최적화할 수 있습니다.

```typescript
export const useTodosQuery = () => {
  const queryInfo = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  return {
    ...queryInfo,
    // 🚨 하지 마세요 - useMemo는 아무런 역할도 수행하지 않습니다!
    data: React.useMemo(
      () => queryInfo.data?.map((todo) => todo.name.toUpperCase()),
      [queryInfo]
    ),

    // ✅ queryInfo.data를 올바르게 메모이제이션 합니다.
    data: React.useMemo(
      () => queryInfo.data?.map((todo) => todo.name.toUpperCase()),
      [queryInfo.data]
    ),
  };
};
```

커스텀 훅 안에 데이터 변환과 결합 등 추가 로직이 있다면 좋은 선택지일 것입니다. 이 방법을 사용할 때에는 데이터에 undefined 값을 가질 수 있으므로, 옵셔널 체이닝을 사용합니다. 이 방법은 useMemo를 통해 최적화를 수행할 수 있지만, devtools 안에서 정확한 구조를 살펴볼 수 없습니다.

또한, data가 undefined 값을 가질 수 있고, 약간 난해하다는 특징이 있습니다.

### 3. select 옵션 사용

React Query에서는 내장 셀렉터 기능을 제공하고 있습니다.

```typescript
export const useTodosQuery = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    select: (data) => data.map((todo) => todo.name.toUpperCase()),
  });
```

이 경우에는, 셀렉터가 data가 존재할 때에만 호출되어 변환되기 때문에 undefined를 걱정할 필요가 없다. 또한, 셀렉터는 렌더링할 때만 실행이 된다. 그리고 이렇게 넘어오는 함수를 `useCallback`을 통해 메모이제이션하여 안정적인 함수 참조를 통해 최적화할 수 있다.

```typescript
const transformTodoNames = (data: Todos) =>
  data.map((todo) => todo.name.toUpperCase());

export const useTodosQuery = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    // ✅ 안정적인 함수 참조를 사용합니다
    select: transformTodoNames,
  });

export const useTodosQuery = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    // ✅ useCallback을 통해 메모이제이션 합니다
    select: React.useCallback(
      (data: Todos) => data.map((todo) => todo.name.toUpperCase()),
      []
    ),
  });
```

## Intro to Re-Fetch - Review

- Issue: [#32](https://github.com/BangDori/react-query-course/issues/32)

Re-Fetch는 서버로부터 데이터를 다시 fetch해오는 것을 의미한다. Re-fetch는 서버로부터 업데이트 된 안정적인 데이터를 보장한다.

어떻게 Re-Fetch를 할까?

우선, 다음 global option 혹은 쿼리 옵션을 통해 컨트롤 할 수 있습니다.

- `refetchOnMount`: 컴포넌트가 마운드 되었을 떄 Re-fetch
- `refetchOnWindowFocus`: 윈도우가 포커스 되었을 경우 Re-fetch
- `refetchOnReconnect`: 네트워크가 재연결 되었을 경우 Re-fetch
- `refetchInterval`: 일정 시간마다 Re-fetch

## Update Global Settings - Reviewㅌ

query 각각에 대한 옵션은, 각 `useQuery` 혹은 `useInfiniteQuery` 등 해당 훅스에서 설정하면 된다. 전역 옵션을 설정하고 싶다면, queryClient에서 전역 설정을 다음과 같이 할 수 있다.

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

전역 설정의 경우에는 설정할 부분이 많아질 경우 즉, 확장성을 대비하여 있기 때문에 default를 사용하지 않는경우에는 queryClient를 관리하는 파일을 분리하는 것이 좋다.
