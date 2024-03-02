## Table of Contents

1. [Adding Data to the Cache - Review](#adding-data-to-the-cache---review)
2. [Pre-Fetching Treatments (concepts) - Review](https://github.com/BangDori/react-query-course/issues/27)

## Adding Data to the Cache - Review

- Issue: [#26](https://github.com/BangDori/react-query-course/issues/26)

1. `prefetchQuery`
   - 캐시에 위치할 쿼리 결과를 미리 가져오는 메서드
   - 만약 쿼리를 위한 데이터가 이미 캐시 내부에 존재하며, 유효하다면 데이터는 fetch되지 않음
   - 만약 다음과 같이 staleTime을 전달했다면 `prfetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })` 데이터가 지정된 staleTime보다 오래된 경우 fetch 된다.
   - 주로 페이지네이션 혹은 사용자가 다음 이동할 페이지를 예측하여, 해당 쿼리를 미리 받아와서 UX를 향상할 수 있다.
2. `setQueryData`
   - `setQueryData`는 쿼리의 cached data를 즉시 업데이트하는데 사용되어질 수 있는 **동기 함수**이다. 만약 query가 존재하지 않는다면, 생성될 것이다.
3. `placeholderData`
   - Placeholder data는 실제 Input 태그의 placeholder과 동일한 자리 표시 데이터를 의미합니다.
   - placeholder data를 활용하면 실제 Input 태그에 대한 value 상태를 가지고 있지 않은 것처럼 캐시에는 데이터가 존재하지 않지만, 초기화 데이터 옵션과 유사하게 데이터가 이미 존재하는 것 처럼 동작할 수 있습니다.
   - 실제 데이터를 백그라운드에서 가져오는 동안 쿼리를 성공적으로 렌더링하기에 데이터가 있는 상황에 유용하다.
4. `initialData`

   - application에서 사용 가능한 쿼리에 대한 초기 데이터가 이미 존재하고 있는 경우, 쿼리에 직접적으로 초기 데이터를 전달해줄 수 있다.
   - `config.initialData` 옵션을 사용하여 쿼리의 초기 데이터를 설정하고 초기 로딩 상태를 건너뛸 수 있음

## Pre-Fetching Treatments (concepts) - Review

- Issue: [#27](https://github.com/BangDori/react-query-course/issues/27)

사용자 연구에 의하면 홈페이지 로드의 85%가 다음 탭 로드로 이어진다고 합니다.

여기서는, useTreatments custom hook에 대한 분석을 하겠습니다. 현재 useTreatments 훅을 확인해보면, useQuery를 이용하여 treatments 데이터를 받아오고 있는 것을 확인할 수 있습니다.

```typescript
// useTreatments.ts

async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get("/treatments");

  return data;
}

export function useTreatments(): Treatment[] {
  const fallback: Treatment[] = [];

  const { data = fallback } = useQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,
  });

  return data;
}
```

그리고 추가적으로, useTreatments를 다시 한번 이야기해보자면, treatments에 대한 정보를 받아오는 훅스라고 생각할 수 있습니다. 그렇다면 prefetch 또한 여기서 처리해주면 어떨까요?

```typescript
// useTreatments.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Treatment } from "@shared/types";

import { axiosInstance } from "@/axiosInstance";
import { queryKeys } from "@/react-query/constants";

async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get("/treatments");

  return data;
}

export function useTreatments(): Treatment[] {
  const fallback: Treatment[] = [];

  const { data = fallback } = useQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,
  });

  return data;
}

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();

  queryClient.prefetchQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,
  });
}
```

useTreatments 훅에서는 treatments에 대한 query와 prefetchQuery를 관리하고 있다. treatments를 관리하는 api 관련 서비스 레이어 로직들이 분리되어 있어 가독성도 향상되었을 뿐만 아니라 관심사가 잘 분리된 것을 확인할 수 있다.
