import { useEffect, useState } from "react";

const useDesktop = (breakpoint = 1024) => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= breakpoint);

    function handleResize() {
      setIsDesktop(window.innerWidth >= breakpoint);
    }

    window.addEventListener("resize", handleResize);

    return (_) => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isDesktop, breakpoint]);

  return isDesktop;
};

export default useDesktop;
