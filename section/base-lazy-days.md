# Base lazy days

1. [Project folder structure](#project-folder-structure)
2. [auth](#auth)
3. [axiosInstance](#axiosinstance)
4. [components](#components)
5. [images](#images)
6. [mocks](#mocks)
7. [react-query](#react-query)
8. [test-utils](#test-utils)
9. [theme](#theme)
10. [types](#types)

## Project folder structure

```
📦src
┣ 📂auth
┃ ┣ 📜AuthContext.tsx
┃ ┣ 📜local-storage.ts
┃ ┣ 📜types.ts
┃ ┗ 📜useAuthActions.tsx
┣ 📂axiosInstance
┃ ┣ 📜constants.js
┃ ┗ 📜index.ts
┣ 📂components
┃ ┣ 📂app
┃ ┃ ┣ 📂hooks
┃ ┃ ┃ ┗ 📜useCustomToast.ts
┃ ┃ ┣ 📜App.tsx
┃ ┃ ┣ 📜Home.tsx
┃ ┃ ┣ 📜Loading.tsx
┃ ┃ ┣ 📜Navbar.tsx
┃ ┃ ┗ 📜toast.tsx
┃ ┣ 📂appointments
┃ ┃ ┣ 📂hooks
┃ ┃ ┃ ┣ 📜constants.ts
┃ ┃ ┃ ┣ 📜monthYear.ts
┃ ┃ ┃ ┣ 📜useAppointments.ts
┃ ┃ ┃ ┣ 📜useCancelAppointment.ts
┃ ┃ ┃ ┗ 📜useReserveAppointment.ts
┃ ┃ ┣ 📂tests
┃ ┃ ┃ ┣ 📜appointmentMutations.test.tsx
┃ ┃ ┃ ┗ 📜useAppointments.test.tsx
┃ ┃ ┣ 📜Appointment.tsx
┃ ┃ ┣ 📜Calendar.tsx
┃ ┃ ┣ 📜DateBox.tsx
┃ ┃ ┣ 📜types.ts
┃ ┃ ┗ 📜utils.ts
┃ ┣ 📂common
┃ ┃ ┣ 📜BackgroundImage.tsx
┃ ┃ ┗ 📜Card.tsx
┃ ┣ 📂staff
┃ ┃ ┣ 📂hooks
┃ ┃ ┃ ┗ 📜useStaff.ts
┃ ┃ ┣ 📂tests
┃ ┃ ┃ ┣ 📜AllStaff.error.test.tsx
┃ ┃ ┃ ┣ 📜AllStaff.test.tsx
┃ ┃ ┃ ┗ 📜useStaff.test.tsx
┃ ┃ ┣ 📜AllStaff.tsx
┃ ┃ ┣ 📜Staff.tsx
┃ ┃ ┗ 📜utils.ts
┃ ┣ 📂treatments
┃ ┃ ┣ 📂hooks
┃ ┃ ┃ ┗ 📜useTreatments.ts
┃ ┃ ┣ 📂tests
┃ ┃ ┃ ┗ 📜Treatments.test.tsx
┃ ┃ ┣ 📜Treatment.tsx
┃ ┃ ┗ 📜Treatments.tsx
┃ ┗ 📂user
┃ ┃ ┣ 📂hooks
┃ ┃ ┃ ┣ 📜usePatchUser.ts
┃ ┃ ┃ ┣ 📜useUser.ts
┃ ┃ ┃ ┗ 📜useUserAppointments.ts
┃ ┃ ┣ 📜Signin.tsx
┃ ┃ ┣ 📜UserAppointments.tsx
┃ ┃ ┗ 📜UserProfile.tsx
┣ 📂react-query
┃ ┣ 📜constants.js
┃ ┣ 📜key-factories.ts
┃ ┗ 📜queryClient.ts
┣ 📂theme
┃ ┗ 📜index.js
┣ 📂types
┃ ┗ 📜images.d.ts
┣ 📜main.tsx
```

해당 프로젝트에서는 너무나 많은 파일과, 폴더를 가지고 있기 때문에 파일이 아닌 폴더를 기준으로 나누어서 분석해보자.

## auth

```
📂auth
┣ 📜AuthContext.tsx
┣ 📜local-storage.ts
┣ 📜types.ts
┗ 📜useAuthActions.tsx
```

### AuthContext.tsx

해당 저장소는 Auth 정보를 담고 있는 Context이다.

우선 AuthContextValue의 타입은 다음과 같이 구성되어있다.

```typescript
type AuthContextValue = {
  userId: number | null;
  userToken: string | null;
  setLoginData: (loginData: LoginData) => void;
  clearLoginData: () => void;
};
```

userId와 userToken을 저장하고 있고, setLoginData를 이용하여 로그인 데이터를 저장하고, clearLoginData를 이용하여 로그인 데이터를 초기화한다.

근데 이전까지 내가 해온 프로젝트에서는 클라이언트에서는 userToken을 header에 추가하여 요청을 생성하고, 서버에게 요청하였을 뿐 userId가 크게 필요하다고 생각한 경우는 없었다. userId를 왜 저장하고 있을까?

useUser hooks을 보면 다음과 같은 코드를 확인할 수 있다.

```typescript
function updateUser(newUser: User): void {
  queryClient.setQueryData(generateUserKey(newUser.id, newUser.token), newUser);
}

function clearUser() {
  queryClient.removeQueries({
    queryKey: [queryKeys.appointments, queryKeys.user],
  });
}
```

userId를 저장하고 있는 이유는, userToken의 경우 데이터가 만료될 경우 이를 클라이언트에서 서버 상태가 만료되었는지를 단번에 알아차리지 못한다. 반면, userId의 경우 사용자가 가진 고정된 값이기 때문에 userId를 이용하여 query를 만들기 위해서 userId를 저장하는 것 같다.

AuthContextProvider에서는 로그인 데이터와 `setLoginData`, `clearLoginData` 메서드를 가진다.

1. `setLoginData`
   - 로그인 데이터를 저장하는 메서드로 LoginData를 상태에 저장하고, 로컬 스토리지에도 저장한다.
2. `clearLoginData`
   - 현재 provider 상태에 저장되어있는 LoginData를 초기화하고, 로컬 스토리지에 저장된 데이터도 초기화한다.

### local-storage.ts

auth 정보에 대한 로컬 스토리지와 관련된 메서드들이 존재하는 파일이다.

1. `getStoredLoginData`: 로그인 데이터를 로컬 스토리지에서 가져오는 메서드
2. `setStoredLoginData`: 로그인 데이터를 로컬 스토리지에 저장하는 메서드
3. `clearStoredLoginData`: 로컬 스토리지에 저장된 로그인 데이터를 제거하는 메서드

### types.ts

다음과 같이 로그인한 사용자의 데이터 타입을 나타내고 있다.

```typescript
export type LoginData = {
  userId: number;
  userToken: string;
};
```

### useAuthActions.tsx

auth에 대한 action을 정의하는 훅이다.

해당 훅에서는 server에 대한 auth 관련 요청을 생성하는 `authServerCall` 메서드와 `signin`, `signup`, `signout` 메서드를 가지서 이를 반환한다.

1. `authServerCall`
   - urlEndpoint, email, password를 매개 변수로 전달받는다.
   - 전달받은 정보를 통해 axios 요청을 생성하고, 서버에게 요청한다.
   - 400 Bad Request 응답의 경우 사용자에게 toast를 이용하여 warning 상태와 메시지를 보여준다.
   - 로그인 성공 시나리오
     - toast를 이용하여 로그인되었음을 보여준다.
     - queryData에 사용자의 정보를 저장한다.
     - auth context에 사용자 정보를 저장한다.
2. `signin`
   - 로그인 메서드로, 사용자의 이메일과 패스워드를 전달한다.
3. `signup`
   - 회원가입 메서드로, 사용자의 이메일과 패스워드를 전달한다
4. `signout`
   - 로그아웃 메서드로, 사용자의 정보와 관련된 모든 정보를 제거한다.
   - 캐시에 저장된 데이터 중 사용자 정보와 연관된 데이터를 제거한다.
   - auth context에 저장되어 있는 사용자 데이터를 초기화한다.
   - toast를 이용하여, 로그아웃 되었음을 사용자에게 보여준다.

## axiosInstance

```
📂axiosInstance
┣ 📜constants.js
┗ 📜index.ts
```

### constants.js

서버의 baseUrl과 baseImageUrl을 가지고 있는 상수 파일이다.

```javascript
export const baseUrl = "http://localhost:3030";
export const baseImageUrl = `${baseUrl}/images`;
```

### index.ts

userToken을 인자로 받아 Authorization이 포함된 JWT 헤더를 만들어주는 getJWTHeader 메서드와 baseURL로 설정된 axiosInstance가 존재한다.

```ts
import axios, { AxiosRequestConfig } from "axios";

import { baseUrl } from "./constants";

export function getJWTHeader(userToken: string): Record<string, string> {
  return { Authorization: `Bearer ${userToken}` };
}

const config: AxiosRequestConfig = { baseURL: baseUrl };
export const axiosInstance = axios.create(config);
```

## components

## images

클라이언트측에서 사용되는 이미지가 저장되어 있는 폴더이다.

## mocks

mock test가 포함된 파일인데, Section 9을 모두 수강하고 난 이후 작성할 계획이다.

## react-query

```
📂react-query
┣ 📜constants.js
┣ 📜key-factories.ts
┗ 📜queryClient.ts
```

### constants.js

query에 사용되는 key들을 보관하고 있는 queryKeys 객체가 있는 파일이다.

queryKey를 중앙에서 관리하게 되면, queryKey가 꼬일일이 없고 한 눈에 쿼리들을 관리할 수 있어 좋은 방법인 것 같다.

```javascript
export const queryKeys = {
  treatments: "treatments",
  appointments: "appointments",
  staff: "staff",
  user: "user",
};
```

### key-factories.ts

query key를 만드는 함수들이 위치해있다.

1. `generateUserKey`: userKey 쿼리 키를 생성하는 메서드이다.
2. `generateUserAppointmentsKey`: user가 예약한 appointments를 가져오기 위한 쿼리 키를 생성하는 메서드이다.

```typescript
import { queryKeys } from "./constants";

export const generateUserKey = (userId: number, userToken: string) => {
  return [queryKeys.user, userId];
};

export const generateUserAppointmentsKey = (
  userId: number,
  userToken: string
) => {
  return [queryKeys.appointments, queryKeys.user, userId, userToken];
};
```

위에 `generateUserKey` 메서드를 보면, userToken을 적용하지 않은 것을 볼 수 있다. 그 이유는 userToken을 적용해버리면, 토큰의 변화에 따라 쿼리 키가 변경되게 되고 동일한 유저에 대한 쿼리 키가 새로 생겨버리게 된다.

일관된 쿼리 키를 유지하기 위해 userToken을 제외하고 userId만을 추가한다.

### queryClient.ts

queryClient를 다루고 있는 파일이다.

우선 queryClient에서 defaultOptions의 경우 [Section 6 - Update Global Settings](https://github.com/BangDori/react-query-course/blob/main/section/section-6.md#update-global-settings---review)에서 다루었던 내용이다.

그리고 queryCache은 [Section 4 - onError Default for Query Client](https://github.com/BangDori/react-query-course/blob/main/section/section-4.md#onerror-default-for-query-client---review)에서 다루고 있고, mutationCache은 [Section 8 - Introduction to Mutations and Mutations Global Settings](https://github.com/BangDori/react-query-course/blob/main/section/section-8.md#introduction-to-mutations-and-mutations-global-settings---review)에서 다루었던 내용이다.

## test-utils

test 정보가 포함된 파일인데, Section 9을 모두 수강하고 난 이후 작성할 계획이다.

## theme

프로젝트에서 사용되는 테마가 포함되어 있는 파일이다.

색상과 폰트 그리고 글로벌 옵션등이 포함되어 있다.

## types

image에 대한 타입을 가지고 있는 모듈 파일이다.
