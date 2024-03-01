# Base infinite swapi

1. [Project folder structure](#project-folder-structure)
2. [InfinitePeople.jsx & InfiniteSpecies.jsx](#infinitepeoplejsx--infinitespeciesjsx)
3. [Person.jsx & Species.jsx](#personjsx--speciesjsx)
4. [App.jsx](#appjsx)

## Project folder structure

```
📦src
 ┣ 📂people
 ┃ ┣ 📜InfinitePeople.jsx
 ┃ ┗ 📜Person.jsx
 ┣ 📂species
 ┃ ┣ 📜InfiniteSpecies.jsx
 ┃ ┗ 📜Species.jsx
 ┣ 📜App.jsx
 ┗ 📜main.jsx
```

## InfinitePeople.jsx & InfiniteSpecies.jsx

InfinitePeople.jsx 컴포넌트를 기준으로 분석해보자.

`@tanstack/react-query`에서 제공해주는 무한 스크롤을 훅스(`useInfiniteQuery`)를 사용합니다. 우선 현재 컴포넌트에서 `useInfiniteQuery`에서 받아오는 데이터는 아래와 같습니다.

```javascript
const initialUrl = "https://swapi.dev/api/people/";

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetching,
  isLoading,
  isError,
  error,
} = useInfiniteQuery({
  queryKey: ["sw-people"],
  queryFn: ({ pageParam = initialUrl }) => fetchUrl(pageParam),
  getNextPageParam: (lastPage) => lastPage.next || undefined,
});
```

순서대로 분석해보겠습니다.

1. data: `useInfiniteQuery`에서 받아오는 데이터
   - 초기 렌더링에서는 비동기 함수인 `queryFn`이 완료되기 전까지는 data는 `undefined` 값을 가집니다.
   - `queryFn`이 완료되기 이전에 data를 화면에 렌더링하게 되면 에러가 발생하기 때문에, `isLoading`을 통해 loading 상태라면 Loading indicator를 반환합니다.
2. fetchNextPage: 다음 페이지의 데이터를 fetch하는 메서드
3. hasNextPage: 다음 페이지가 존재하는지에 대한 여부를 반환하는 Boolean 값
4. isFetching: 데이터를 fetching하는 중인지에 대한 여부를 반환하는 Boolean 값
5. isLoading: isFetching + no cached data 에 대한 여부를 반환하는 Boolean 값
6. isError: 데이터를 fetch 해오는 도중에 에러가 발생했는지에 대한 여부를 반환하는 Boolean 값
7. error: 에러가 발생할 경우, 에러 정보가 저장
8. pageParam: 여기서 pageParam은 initialUrl을 나타내고 있는데, initialUrl은 서버의 API URI를 의미한다.
   - pageParam은 useInfiniteQuery에 의해 관리되며, getNextPageParam에 의해 업데이트 된다.
9. getNextPageParam를 진행한 이후에, pageParam을 업데이트한다.

이렇게 해서 받아온 data를 isLoading, isError 각각에 대해 처리하고, 무한 스크롤은 다음과 같이 구현을 한다.

```tsx
<InfiniteScroll
  loadMore={() => {
    if (!isFetching) fetchNextPage();
  }}
  hasMore={hasNextPage}
>
  {data.pages.map((pageData) => {
    return pageData.results.map((person) => (
      <Person
        key={person.name}
        name={person.name}
        hairColor={person.hair_color}
        eyeColor={person.eye_color}
      />
    ));
  })}
</InfiniteScroll>
```

여기서 InfiniteScroll 컴포넌트에 대한 설명은 section-3 [React Infinite Scroller - Review](https://github.com/BangDori/react-query-course/blob/main/section/section-3.md#react-infinite-scroller---review)에서 확인할 수 있다.

`data.pages`이 이해가 안될 수 있는데, 실제로 fetch 해온 정보가 데이터에 pages 배열에 저장된다. 이때, pages 배열에 다 저장되는 것이 아닌, 각각의 페이지 혹은 다음 세트가 인덱스로 분리되어 저장되어 진다.

그렇기 때문에, data.pages를 통해 각각의 페이지 데이터를 Map 메서드를 활용하여 생성한다. 그리고 pageData에 results에 실제 데이터들이 저장되기 때문에 results를 통해 Person 컴포넌트를 생성하여 화면에 표시한다.

## Person.jsx & Species.jsx

Person 컴포넌트와 Species 컴포넌트의 구조가 동일하기 때문에, Person 컴포넌트를 기준으로 설명하겠습니다.

Person 컴포넌트의 경우, 단순하게 부모 컴포넌트인 InfinitePeople 컴포넌트에서 받아온 데이터를 렌더링해주는 역할을 합니다. 이때, props로 `name`, `hairColor`, `eyeColor`를 받아오며 이를 화면에 렌더링 해줍니다.

## App.jsx

App.jsx 설정의 경우 이전 [base-blog-em App.tsx](https://github.com/BangDori/react-query-course/blob/main/section/base-blog-em.md#apptsx)의 구조와 큰 차이가 없기 때문에 생략하겠습니다.
