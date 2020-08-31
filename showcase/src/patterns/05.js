import React, {
  createContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
  useContext,
} from "react";
import mojs from "mo-js";
import styles from "./index.css";
import userStyles from "./usage.css";

const initialState = {
  isClicked: false,
  count: 0,
  countTotal: 44,
};

/***
 * Custom hook for animation
 ***/
const useClapAnimation = ({ clapEl, clapCountEl, clapTotalEl }) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    () => new mojs.Timeline()
  );

  useLayoutEffect(() => {
    if (!clapEl || !clapCountEl || !clapTotalEl) {
      return;
    }

    const tlDuration = 300;
    const scaleButton = new mojs.Html({
      el: clapEl,
      duration: tlDuration,
      scale: { 1.3: 1 },
      ease: mojs.easing.ease.out,
    });

    const triangleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: "polygon",
        radius: { 6: 0 },
        stroke: "rgba(211, 54, 0, 0.5)",
        strokeWidth: 5,
        angle: 210,
        delay: 30,
        speed: 0.2,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: tlDuration,
      },
    });

    const cirleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 75 },
      // count: 5,
      angle: 25,
      children: {
        shape: "circle",
        fill: "rgba(149,165,166,0.5)",
        delay: 30,
        speed: 0.2,
        radius: { 3: 0 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
      },
    });

    const countAnimation = new mojs.Html({
      el: clapCountEl,
      opacity: { 0: 1 },
      y: { 0: -30 },
      duration: tlDuration,
    }).then({
      opacity: { 1: 0 },
      y: -80,
      delay: tlDuration / 2,
    });

    const countTotalAnimation = new mojs.Html({
      el: clapTotalEl,
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
      y: { 0: -3 },
    });

    if (typeof clapEl === "string") {
      const clap = document.getElementById("clap");
      clap.style.transform = "scale(1,1)";
    } else {
      clapEl.style.transform = "scale(1,1)";
    }

    const newAnimationTimeline = animationTimeline.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
      triangleBurst,
      cirleBurst,
    ]);
    setAnimationTimeline(newAnimationTimeline);
  }, [clapEl, clapCountEl, clapTotalEl]);

  return animationTimeline;
};

const MediumClapContext = createContext();
const { Provider } = MediumClapContext;

const MediumClap = ({
  children,
  onClap,
  values = null,
  style: userStyles = {},
  className,
}) => {
  const MAXIMUM_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count } = clapState;

  const [{ clapRef, clapCountRef, clapTotalRef }, setRefState] = useState({});

  const setRef = useCallback((node) => {
    setRefState((prevRefState) => ({
      ...prevRefState,
      [node.dataset.refkey]: node,
    }));
  }, []);

  const animationTimeline = useClapAnimation({
    clapEl: clapRef,
    clapCountEl: clapCountRef,
    clapTotalEl: clapTotalRef,
  });

  const componentJustMounted = useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current && !isControlled) {
      onClap && onClap(clapState);
    }
    componentJustMounted.current = false;
  }, [count, onClap, isControlled]);

  // controlled component
  const isControlled = !!values && onClap;
  const handleClapClick = () => {
    animationTimeline.replay();
    isControlled
      ? onClap()
      : setClapState((prevstate) => ({
          isClicked: true,
          count: Math.min(prevstate.count + 1, MAXIMUM_USER_CLAP),
          countTotal:
            count < MAXIMUM_USER_CLAP
              ? prevstate.countTotal + 1
              : prevstate.countTotal,
        }));
  };

  const getState = () =>
    useCallback(() => (isControlled ? values : clapState), [
      isControlled,
      values,
      clapState,
    ]);

  const memoizedValue = useMemo(
    () => ({
      ...getState(),
      setRef,
    }),
    [getState, setRef]
  );

  const classNames = [styles.clap, className].join(" ").trim();

  return (
    <Provider value={memoizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={classNames}
        onClick={handleClapClick}
        style={userStyles}
      >
        {children}
      </button>
    </Provider>
  );
};

// subcomponents

const ClapIcon = ({ style: userStyles = {}, className }) => {
  const { isClicked } = useContext(MediumClapContext);
  const classNames = [styles.icon, isClicked ? styles.checked : "", className]
    .join(" ")
    .trim();
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 80"
        x="0px"
        y="0px"
        className={classNames}
        style={userStyles}
      >
        <title>Sunflower</title>
        <g>
          <path d="M6.991,61.076a1,1,0,0,0,1,1H55.9a1,1,0,0,0,0-2H47.738c.207-.172.409-.353.6-.546a8.635,8.635,0,0,0,2.546-6.145v-3.65a1,1,0,0,0-1-1H39.636a8.633,8.633,0,0,0-6.145,2.545c-.192.193-.373.394-.545.6V38.742a3.8,3.8,0,0,0,2.36-1.9,3.82,3.82,0,0,0,.99.6,3.786,3.786,0,0,0,5.221-3.171,3.8,3.8,0,0,0,1.144.174,3.787,3.787,0,0,0,3.61-4.928A3.792,3.792,0,0,0,48.845,23.3a3.786,3.786,0,0,0,0-6.72,3.788,3.788,0,0,0-2.575-6.211,3.785,3.785,0,0,0-4.753-4.753,3.791,3.791,0,0,0-6.211-2.575,3.786,3.786,0,0,0-6.72,0,3.812,3.812,0,0,0-.99-.6,3.785,3.785,0,0,0-5.221,3.174,3.786,3.786,0,0,0-4.754,4.753,3.785,3.785,0,0,0-2.571,6.21,3.785,3.785,0,0,0,0,6.722,3.79,3.79,0,0,0,2.571,6.212,3.786,3.786,0,0,0,4.751,4.752,3.862,3.862,0,0,0,.276,1.125,3.787,3.787,0,0,0,5.937,1.446,3.8,3.8,0,0,0,2.361,1.906v13.14c-.172-.207-.353-.409-.546-.6a8.631,8.631,0,0,0-6.145-2.545H14.006a1,1,0,0,0-1,1v3.65a8.632,8.632,0,0,0,2.545,6.145c.192.193.395.374.6.546H7.991A1,1,0,0,0,6.991,61.076Zm27.914-8.382a6.65,6.65,0,0,1,4.731-1.959h9.25v2.65a6.649,6.649,0,0,1-1.96,4.731,6.741,6.741,0,0,1-4.731,1.96H32.946V57.425A6.65,6.65,0,0,1,34.905,52.694ZM19.716,19.94a12.23,12.23,0,1,1,12.23,12.229A12.243,12.243,0,0,1,19.716,19.94ZM39.4,34.623a1.787,1.787,0,0,1-3.3,0l-.4-.972a14.1,14.1,0,0,0,3.3-1.367l.4.972A1.777,1.777,0,0,1,39.4,34.623Zm4.528-2.7a1.789,1.789,0,0,1-2.526,0l-.747-.748a14.379,14.379,0,0,0,2.526-2.526l.747.747A1.79,1.79,0,0,1,43.924,31.919Zm3.673-5.5a1.788,1.788,0,0,1-2.335.966l-.972-.4a14.1,14.1,0,0,0,1.368-3.3l.971.4A1.789,1.789,0,0,1,47.6,26.423Zm1.289-6.483A1.788,1.788,0,0,1,47.1,21.726H46.05a12.822,12.822,0,0,0,0-3.572H47.1A1.788,1.788,0,0,1,48.886,19.94ZM47.6,13.458a1.784,1.784,0,0,1-.969,2.333l-.97.4a14.141,14.141,0,0,0-1.367-3.3l.971-.4A1.79,1.79,0,0,1,47.6,13.458Zm-4.936-6.02a1.787,1.787,0,0,1,1.263,3.05l-.747.747A14.351,14.351,0,0,0,40.65,8.709l.748-.748A1.775,1.775,0,0,1,42.661,7.438Zm-5.6-3.148A1.786,1.786,0,0,1,39.4,6.623l-.4.972a14.116,14.116,0,0,0-3.3-1.367l.4-.973A1.769,1.769,0,0,1,37.061,4.29ZM31.946,3a1.787,1.787,0,0,1,1.786,1.786v1.05a12.829,12.829,0,0,0-3.573,0V4.786A1.789,1.789,0,0,1,31.946,3ZM25.464,4.289a1.79,1.79,0,0,1,2.333.966l.4.973A14.1,14.1,0,0,0,24.9,7.6l-.4-.972A1.79,1.79,0,0,1,25.464,4.289Zm-5.5,3.672a1.787,1.787,0,0,1,2.526,0l.747.748a14.311,14.311,0,0,0-2.526,2.526l-.748-.747A1.789,1.789,0,0,1,19.968,7.961Zm-3.672,5.5a1.786,1.786,0,0,1,2.333-.967l.971.4a14.152,14.152,0,0,0-1.367,3.3l-.971-.4a1.784,1.784,0,0,1-.966-2.334Zm-1.29,6.483a1.788,1.788,0,0,1,1.786-1.786H17.84a12.924,12.924,0,0,0,0,3.572H16.792A1.788,1.788,0,0,1,15.006,19.94ZM16.3,26.423a1.788,1.788,0,0,1,.967-2.334l.971-.4a14.112,14.112,0,0,0,1.368,3.3l-.972.4A1.789,1.789,0,0,1,16.3,26.423Zm6.2,5.5a1.787,1.787,0,0,1-2.527-2.526l.748-.748a14.311,14.311,0,0,0,2.526,2.526Zm2.969,3.671a1.788,1.788,0,0,1-.967-2.333l.4-.972a14.167,14.167,0,0,0,3.3,1.367l-.4.972A1.788,1.788,0,0,1,25.463,35.59Zm4.7-.5v-1.05a12.829,12.829,0,0,0,3.573,0v1.05a1.787,1.787,0,0,1-3.573,0ZM16.965,58.116a6.65,6.65,0,0,1-1.959-4.731v-2.65h9.249a6.69,6.69,0,0,1,6.691,6.69v2.651H21.7A6.742,6.742,0,0,1,16.965,58.116Z" />
          <path d="M26.3,12.94h1.3a1,1,0,0,0,0-2H26.3a1,1,0,0,0,0,2Z" />
          <path d="M31.3,12.94h1.3a1,1,0,0,0,0-2H31.3a1,1,0,0,0,0,2Z" />
          <path d="M36.3,12.94h1.3a1,1,0,0,0,0-2H36.3a1,1,0,0,0,0,2Z" />
          <path d="M23.8,16.94h1.3a1,1,0,0,0,0-2H23.8a1,1,0,1,0,0,2Z" />
          <path d="M27.8,15.94a1,1,0,0,0,1,1h1.3a1,1,0,1,0,0-2H28.8A1,1,0,0,0,27.8,15.94Z" />
          <path d="M32.8,15.94a1,1,0,0,0,1,1h1.3a1,1,0,1,0,0-2H33.8A1,1,0,0,0,32.8,15.94Z" />
          <path d="M37.8,15.94a1,1,0,0,0,1,1h1.3a1,1,0,1,0,0-2H38.8A1,1,0,0,0,37.8,15.94Z" />
          <path d="M23.6,19.94a1,1,0,0,0-1-1H21.3a1,1,0,0,0,0,2h1.3A1,1,0,0,0,23.6,19.94Z" />
          <path d="M26.3,18.94a1,1,0,0,0,0,2h1.3a1,1,0,0,0,0-2Z" />
          <path d="M33.6,19.94a1,1,0,0,0-1-1H31.3a1,1,0,0,0,0,2h1.3A1,1,0,0,0,33.6,19.94Z" />
          <path d="M37.6,20.94a1,1,0,0,0,0-2H36.3a1,1,0,0,0,0,2Z" />
          <path d="M40.3,19.94a1,1,0,0,0,1,1h1.3a1,1,0,0,0,0-2H41.3A1,1,0,0,0,40.3,19.94Z" />
          <path d="M26.1,23.94a1,1,0,0,0-1-1H23.8a1,1,0,0,0,0,2h1.3A1,1,0,0,0,26.1,23.94Z" />
          <path d="M31.1,23.94a1,1,0,0,0-1-1H28.8a1,1,0,0,0,0,2h1.3A1,1,0,0,0,31.1,23.94Z" />
          <path d="M36.1,23.94a1,1,0,0,0-1-1H33.8a1,1,0,0,0,0,2h1.3A1,1,0,0,0,36.1,23.94Z" />
          <path d="M40.1,22.94H38.8a1,1,0,0,0,0,2h1.3a1,1,0,0,0,0-2Z" />
          <path d="M27.6,26.94H26.3a1,1,0,0,0,0,2h1.3a1,1,0,0,0,0-2Z" />
          <path d="M33.6,27.94a1,1,0,0,0-1-1H31.3a1,1,0,0,0,0,2h1.3A1,1,0,0,0,33.6,27.94Z" />
          <path d="M37.6,26.94H36.3a1,1,0,0,0,0,2h1.3a1,1,0,0,0,0-2Z" />
          <path d="M38.5,54.5h6.674a1,1,0,0,0,0-2H38.5a1,1,0,0,0,0,2Z" />
          <path d="M25.391,52.5H18.716a1,1,0,0,0,0,2h6.675a1,1,0,0,0,0-2Z" />
        </g>
        <text
          x="0"
          y="79"
          fill="#000000"
          fontSize="5px"
          fontWeight="bold"
          fontFamily="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif"
        >
          Created by Lima Studio
        </text>
        <text
          x="0"
          y="84"
          fill="#000000"
          fontSize="5px"
          fontWeight="bold"
          fontFamily="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif"
        >
          from the Noun Project
        </text>
      </svg>
    </span>
  );
};

const ClapCount = ({ style: userStyles = {}, className }) => {
  const { count, setRef } = useContext(MediumClapContext);
  const classNames = [styles.count, className].join(" ").trim();
  return (
    <span
      ref={setRef}
      data-refkey="clapCountRef"
      className={classNames}
      style={userStyles}
    >
      + {count}
    </span>
  );
};

const ClapTotal = ({ styles: userStyles = {}, className }) => {
  const { countTotal, setRef } = useContext(MediumClapContext);
  const classNames = [styles.total, className].join(" ").trim();
  return (
    <span
      ref={setRef}
      data-refkey="clapTotalRef"
      className={classNames}
      style={userStyles}
    >
      {countTotal}
    </span>
  );
};

MediumClapContext.Icon = ClapIcon;
MediumClapContext.Count = ClapCount;
MediumClapContext.Total = ClapTotal;

/***
 * Usage
 */
const INITIAL_STATE = {
  count: 0,
  countTotal: 2100,
  isClicked: false,
};
const MAXIMUM_CLAP_VAL = 10;

const Usage = () => {
  const [state, setState] = useState(INITIAL_STATE);
  const handleClap = () => {
    setState(({ count, countTotal }) => ({
      count: Math.min(count + 1, MAXIMUM_CLAP_VAL),
      countTotal: count < MAXIMUM_CLAP_VAL ? countTotal + 1 : countTotal,
      isClicked: true,
    }));
  };

  return (
    <div style={{ width: "100%" }}>
      <MediumClap
        values={state}
        onClap={handleClap}
        className={userStyles.clap}
      >
        <MediumClapContext.Icon className={userStyles.icon} />
        <MediumClapContext.Count className={userStyles.count} />
        <MediumClapContext.Total className={userStyles.total} />
      </MediumClap>
      <MediumClap
        values={state}
        onClap={handleClap}
        className={userStyles.clap}
      >
        <MediumClapContext.Icon className={userStyles.icon} />
        <MediumClapContext.Count className={userStyles.count} />
        <MediumClapContext.Total className={userStyles.total} />
      </MediumClap>
    </div>
  );
};

export default Usage;
