# Base blog em

1. [Project folder structure](#project-folder-structure)
2. [api.ts](#apits)
3. [App.tsx](#apptsx)
4. [PostDetail.tsx](#postdetailtsx)
5. [Posts.tsx](#poststsx)
6. [스스로하는 Q&A](#스스로하는-qa)

## project folder structure

```
📦src
┣ 📜api.ts
┣ 📜App.tsx
┣ 📜main.tsx
┣ 📜PostDetail.tsx
┗ 📜Posts.tsx
```

## api.ts

1. fetchPosts
   - server에서 page에 해당하는 post를 가져오는 함수
   - parameter: `pageNum` default pageNum is 1.
   - method: GET
2. fetchComments
   - server에서 postId에 해당하는 comment를 가져오는 함수
   - parameter: `postId`
   - method: GET
3. deletePost
   - server에서 postId에 해당하는 post를 삭제하는 함수
   - parameter: `postId`
   - method: DELETE
4. updatePost
   - server에서 postId에 해당하는 post를 업데이트하는 함수
   - parameter: `postId`
   - method: PATCH

## App.tsx

1. queryClient를 선언 `const queryClient = new QueryClient();`
2. React Application 내부에 `QueryClientProvider` 컴포넌트를 Mapping하고, React Query를 사용하기 위해 속성으로 client에 queryClient를 추가

   ```tsx
   const queryClient = new QueryClient();

   <QueryClientProvider client={queryClient}>
     <Component />
   </QueryClientProvider>;
   ```

3. React Query 디버깅을 도와주는 도구를 활용하기 위해 QueryClientProvider 내부 최상단에서 React Query devtools를 추가

   ```tsx
   const queryClient = new QueryClient();

   <QueryClientProvider client={queryClient}>
     <Component />
     <ReactQueryDevTools />
   </QueryClientProvider>;
   ```

   - 이때, React Query devtools는 `@tanstack/react-query`에 포함된 모듈이 아니라 `@tanstack/react-query-devtools`에 포함된 모듈이다.
   - 그렇기 때문에, React Query devtools를 사용하기 위해서는 `@tanstack/react-query-devtools` 라이브러리를 별도로 설치해주어야 한다.

```tsx
// App.tsx
import Posts from "./Posts";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Blog &apos;em Ipsum</h1>
        <Posts />
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
```

## PostDetail.tsx

- PostDetail 컴포넌트에서 useQuery를 활용하여 댓글에 대한 정보를 받아옴
- 게시물의 댓글을 가져올 때, `comments` 쿼리 키 하나만 할당하는 것이 아닌, 게시물의 아이디를 함께 전달
  - [Section 2 Query keys](https://github.com/BangDori/react-query-course/blob/main/section/section-2.md#query-keys)

## Posts.tsx

- Post Component 내부에서 2개의 상태를 관리

  1. `currentPage`: 현재 페이지
  2. `selectedPost`: 사용자가 선택한 게시물
     - 현재 Posts 컴포넌트에서는 게시물의 ID가 아닌, 게시물에 대한 정보(객체)를 저장
     - 상황에 따라 게시물의 ID를 저장하거나, 게시물에 대한 정보를 저장할 수 있겠지만 게시물에 대한 정보를 저장하는 경우에는 게시물을 클릭했을 때 게시물 정보를 다시 받아올 필요가 없기 때문에 PostDetail 컴포넌트에서 View 영역에만 집중할 수 있게 됨.

- useQuery를 활용하여 현재 페이지에 해당하는 게시물 받아오기

  ```typescript
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["posts", currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2 * 1000, // 2 seconds
  });
  ```

  - queryKey에 `posts`와 currentPage를 함께 넘겨주는 이유는 [Section 2 Pagination](https://github.com/BangDori/react-query-course/blob/main/section/section-2.md#pagination)https://github.com/BangDori/react-query-course/blob/main/section/section-2.md#pagination에서 설명하는 데로, 의존성 배열을 통해 해당 페이지에 대한 정보를 refresh 하기 위함
  - staleTime은 2초로 임의 설정함으로써, 2초가 지나면 fresh 상태에서 stale 상태로 변경되고 데이터를 refetch 하게 됨

  - ⭐ isLoading과 isError를 통해 loading 상태와 error 상태를 표시

- queryClient를 활용하여 다음 페이지에 대한 정보를 미리 받아오기

  ```typescript
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentPage < maxPostPage) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ["posts", nextPage],
        queryFn: () => fetchPosts(nextPage),
      });
    }
  }, [currentPage, queryClient]);
  ```

  - 다음 페이지에 대한 정보를 prefetch하기 위해 Posts 컴포넌트에서 queryClient를 가져와서 사용해야함. `queryClient.prefetchQuery`
  - `prefetchQuery`의 메서드 인자는 `useQuery`와 동일하게 queryKey와 queryFn을 전달
  - 이때 다음 페이지에 대한 정보를 요청하기 위한 queryKey는 `["posts", nextPage]`로 설정

- Mutation

  ```typescript
  const deleteMutation = useMutation({
    mutationFn: (postId: number) => deletePost(postId),
  });
  const updateMutation = useMutation({
    mutationFn: (postId: number) => updatePost(postId),
  });
  ```

  - 삭제와 업데이트에 대한 mutation 메서드를 생성하여 관리
  - 이때 중요한 점은, 다른 게시물을 클릭할 때 mutation 메서드를 reset 해주어야 한다는 것이다. 왜냐하면, **각각의 게시물에 대해 개별적으로 mutation이 존재하는 것이 아니라 이벤트 위임을 통해 상위에서 관리**한다. 그렇기에 mutation에 대한 error 혹은 success 상태가 남아있기 때문에 다음 게시물로 이동할 때 이러한 mutation state를 반드시 초기화해주어야 한다!

## 스스로하는 Q&A

### 1. Post 삭제와 업데이트에 대한 함수를 `useMutation`을 통해 생성하였는데, `useMutation`을 통해 삭제 및 업데이트를 하지 않고 그냥 API 함수를 호출하여 삭제 및 업데이트를 진행하면 안되는걸까?

useMutation을 사용하지 않고 직접 API 함수를 호출해서 데이터를 삭제하거나 업데이트하는 경우, 데이터 동기화 및 캐싱에 관련된 몇 가지 이슈가 발생할 수 있습니다.

1. 캐시 무효화: React Query는 서버 상태를 효율적으로 동기화하기 위해 내부 캐싱 메커니즘을 사용합니다. `useMutation`을 사용할 때, **성공, 에러, 그리고 마지막으로 데이터 변화 시점에 대한 콜백을 제공할 수 있어서, 관련된 쿼리의 캐시를 적절히 무효화하거나 업데이트**할 수 있습니다. 직접 API를 호출하는 경우, 이러한 캐시 관리를 수동으로 처리해야 하며, 이는 데이터 일관성을 유지하기 어렵게 만들 수 있습니다.
2. 로딩 및 에러 상태 관리: `useMutation`을 사용하면, **요청의 로딩 상태, 에러 상태, 그리고 데이터 상태를 쉽게 관리**할 수 있습니다. 이는 **컴포넌트에서 이러한 상태들을 쉽게 반영할 수 있게 하여 사용자 경험을 개선**합니다. 직접 API를 호출하는 경우, 이러한 상태들을 수동으로 관리해야 하며, 이는 추가적인 코드와 복잡성을 초래할 수 있습니다.
3. 사이드 이펙트 관리: `useMutation`은 **성공, 에러, 그리고 마지막으로 데이터 변화 시점에 대한 콜백을 제공하여, 데이터 변화에 따른 사이드 이펙트를 쉽게 관리**할 수 있게 합니다. 예를 들어, 데이터가 성공적으로 업데이트 된 후에 사용자를 다른 페이지로 리다이렉트 하거나, 성공 메시지를 보여주는 것과 같은 작업을 쉽게 할 수 있습니다. 직접 API를 호출하는 경우, 이러한 사이드 이펙트를 수동으로 처리해야 합니다.
4. 재시도 및 지연 전략: React Query의 `useMutation`은 **실패한 요청에 대한 재시도 로직이나 지연 전략을 쉽게 구현할 수 있는 옵션을 제공**합니다. 직접 API를 호출하는 경우, 이러한 로직을 직접 구현해야 합니다.

직접 API를 호출하는 방식은 간단한 경우나 React Query를 사용하지 않는 프로젝트에서는 문제가 되지 않을 수 있습니다. 하지만, **애플리케이션의 데이터 동기화와 상태 관리를 쉽고 효율적으로 처리하고자 할 때는 `useMutation`과 같은 React Query의 기능을 활용하는 것이 좋음**
