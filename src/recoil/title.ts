import { useEffect } from 'react';
import { atom, SetterOrUpdater, useRecoilState } from 'recoil';

const titleState = atom<string | undefined>({
  key: 'pageTitle',
  default: undefined,
});

export const useTitle: (
  value?: string
) => [string | undefined, SetterOrUpdater<string | undefined>] = (value) => {
  const [title, setTitle] = useRecoilState(titleState);

  useEffect(() => {
    if (value !== undefined) {
      setTitle(value);
    }
    return () => {
      setTitle(undefined);
    };
  }, [setTitle, value]);

  return [title, setTitle];
};
