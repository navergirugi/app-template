# Git 권한 오류 (403 Forbidden) 해결 가이드

Git Push 시 권한 오류(`Permission denied` 또는 `403 Forbidden`)가 발생할 때 해결 방법입니다.

## 증상
```
remote: Permission to <저장소>.git denied to <사용자>.
fatal: unable to access '...': The requested URL returned error: 403
```
내 계정이 아닌 다른 계정 정보로 로그인이 되어있거나, 권한이 꼬였을 때 발생합니다.

## 해결 방법

터미널에서 아래 명령어를 입력하여 원격 저장소 주소에 **강제로 내 아이디를 명시**하면, 로그인 창이 다시 뜨거나 올바른 계정으로 인증을 시도하게 됩니다.

```powershell
# 사용법: git remote set-url origin https://<내아이디>@github.com/<저장소주소>.git

# 예시 (내 아이디가 navergirugi 일 때)
git remote set-url origin https://navergirugi@github.com/navergirugi/app-template.git
```

명령어 입력 후 다시 `git push`를 시도하면 브라우저 인증 창이나 비밀번호 입력 창이 뜹니다. 이때 올바른 계정으로 로그인해 주세요.
