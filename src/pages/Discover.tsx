import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import React, { useEffect, useRef, useState } from "react";
import { SubPageLayout } from "@/pages/layouts/SubPageLayout";
import "@splidejs/react-splide/css";
import { useTranslation } from "react-i18next";
import { Icon, Icons } from "@/components/Icon";
import { Tab } from "@headlessui/react";
import { Helmet } from "react-helmet-async";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { useNavigate, useSearchParams } from "react-router-dom";
import { get } from "@/backend/metadata/tmdb";
import { conf } from "@/setup/config";

interface Movie {
    id: number,
    title: string,
    name: string, // tv变名

    // 描述
    overview: string,
    genre_ids: Array<number>,
    // 发布时间 "2022-03-30"
    release_date: string,
    first_air_date: string, // tv变名
    // 原始语言
    original_language: string,
    adult: boolean,
    backdrop_path: string,
    // 相关分
    popularity: number,
    poster_path: string,
    vote_average: number,
    video: boolean,
}

interface WatchProviders {
    [key: string]: number; // 定义索引签名
}

interface Providers {
    Netflix: Array<Movie>,
    Prime: Array<Movie>,
    Max: Array<Movie>,
    Disney: Array<Movie>,
    AppleTV: Array<Movie>,
    Paramount: Array<Movie>
}

interface Data {
    now_playing: Array<Movie>,
    popular: Array<Movie>,
    top_rated: Array<Movie>,
    upcoming: Array<Movie>,
    watch_providers: Providers,
}

export const Discover: React.FC = () => {
    const { t, i18n } = useTranslation();
    // {t("settings.account.admin.title")}
    const i18nLang = i18n.language;
    const [searchParams, setSearchParams] = useSearchParams();
    const movieType = searchParams.get("type") === "tv" ? "tv" : "movie";
    const movieUrls = {
        "now_playing": `movie/now_playing`,
        "popular": `movie/popular`,
        "top_rated": `movie/top_rated`,
        "upcoming": `movie/upcoming`,
        "watch_providers": (provider_code: string) => `discover/movie?with_watch_providers=${provider_code}&watch_region=US`
    };
    const seriesUrls = {
        "now_playing": `tv/airing_today`,
        "popular": `tv/popular`,
        "top_rated": `tv/top_rated`,
        "upcoming": `tv/on_the_air`,
        "watch_providers": (provider_code: string) => `discover/tv?with_watch_providers=${provider_code}&watch_region=US`
    };
    const watchProviders: WatchProviders = {
        Netflix: 8,
        Prime: 9,
        Max: 1899,
        Disney: 337,
        AppleTV: 2,
        Paramount: 531
    };
    const posterUrl = (uri: string) => `https://image.tmdb.org/t/p/w440_and_h660_face${uri}`;
    const backdropUrl = (uri: string) => `https://image.tmdb.org/t/p/original${uri}`;
    const [data, setData] = useState<Data>();
    const [loading, setLoading] = useState<boolean>(true);
    // 使用 useRef 来确保请求只在首次加载时进行
    const didFetch = useRef(false);
    const navigate = useNavigate();
    const [flatData, setFlatData] = useState<Array<any>>([]);
    const requestData = async (url: string) => {
        return get<any>(url, {
            api_key: conf().TMDB_READ_API_KEY,
            language: i18nLang
        }).then(res => res.results);
    };
    // 页面渲染后一次性完成所有请求
    useEffect(() => {
        const fetchAllData = async () => {
            if (didFetch.current) return;
            const tmdbUrls: any = movieType === "tv" ? seriesUrls : movieUrls;
            const tempReq: Array<any> = [];
            // const tempProvReq: Array<any> = [];
            // const tempProData: any = {};
            // 循环所有的板块url
            Object.keys(tmdbUrls).forEach((urlName) => {
                // 提供商需要多次请求
                if (urlName === "watch_providers") {
                    Object.keys(watchProviders).forEach(providerName => {
                        // 获取&&拼接提供商url
                        const providerUrl = tmdbUrls[urlName](watchProviders[providerName]);
                        // 存储提供商请求为一元，读取时根据provName判断
                        tempReq.push({ name: urlName, provName: providerName, req: requestData(providerUrl) });
                    });
                } else {
                    // 存储常规请求
                    tempReq.push({ name: urlName, req: requestData(tmdbUrls[urlName]) });
                }
            });
            try {
                const results = await Promise.all(tempReq.map(req => req.req));
                const fuck: Array<any> = [];
                const combinedData = tempReq.reduce((acc, item, index) => {
                    if (item.provName) {
                        acc[item.name] = acc[item.name] || {};
                        acc[item.name][item.provName] = results[index];
                    } else {
                        acc[item.name] = results[index];
                    }
                    fuck.push(...results[index]);
                    return acc;
                }, {});
                setFlatData(fuck);
                setData(combinedData);
                setLoading(false);
                didFetch.current = true; // 请求完成后设置为 true
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    function renderArrow() {
        return (
            <div className="splide__arrows">
                <button type="button"
                        className="splide__arrow--prev absolute top-1/2 transform -translate-y-3/4 z-10 !left-[.5em]">
                    <div
                        className="cursor-pointer text-white flex justify-center items-center h-10 w-10 rounded-full bg-search-hoverBackground active:scale-110 transition-[transform,background-color] duration-200">
                        <Icon icon={Icons.ARROW_RIGHT} />
                    </div>
                </button>
                <button type="button"
                        className="splide__arrow--next absolute top-1/2 transform -translate-y-3/4 z-10 !right-[.5em]">
                    <div
                        className="cursor-pointer text-white flex justify-center items-center h-10 w-10 rounded-full bg-search-hoverBackground active:scale-110 transition-[transform,background-color] duration-200">
                        <Icon icon={Icons.ARROW_RIGHT} />
                    </div>
                </button>
            </div>
        );
    }

    function randomMovie() {
        // 根据对象的某个键（如 id）进行去重
        const uniqueArray = Array.from(new Set(flatData.map(item => item.id)))
        .map(id => {
            return flatData.find(item => item.id === id);
        });

        // 随机选择一个元素
        const movie = uniqueArray[Math.floor(Math.random() * uniqueArray.length)];
        console.log(movie);
        return `/media/tmdb-${movieType}-${movie.id}-${movieType === "movie" ? movie.title : movie.name}`;
    }

    return (
        <SubPageLayout>
            <div className="mx-auto max-w-full px-8 w-[1300px] sm:px-16">
                {/* 标题 */}
                <div className="mb-16 sm:mb-2">
                    <Helmet>
                        {/* Hide scrollbar lmao */}
                        <style type="text/css">{`
                        // html, body {
                        //   scrollbar-width: none;
                        //   -ms-overflow-style: none;
                        // }
                        .watch_providers::-webkit-scrollbar{
                            height: 1px;
                        }
                        .dice-image {
                          transition: transform 0.3s ease;
                        }
                        
                        .dice-btn:hover .dice-image {
                          transform: rotate(360deg);
                        }
                        .incoming::-webkit-scrollbar{
                            width: 1px;
                        }
                      `}</style>
                    </Helmet>
                    <PageTitle subpage k="discover.discover" />
                    <div className="mt-44 space-y-16 text-center">
                        <div className="relative z-10 mb-16">
                            <h1 className="text-4xl cursor-default font-bold text-white">
                                {t("discover.discover")}
                            </h1>
                        </div>
                    </div>
                </div>
                {/* 随机选择播放 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-nowrap gap-3">
                        <a type="button" href="?type=movie"
                           onClick={movieType === "movie" ? (event) => {
                               event.preventDefault();
                           } : undefined}
                           className={[
                               "flex items-center space-x-2 rounded-full px-4 text-white py-2",
                               movieType === "movie" ? "bg-pill-background bg-opacity-50 cursor-not-allowed" : "hover:bg-pill-backgroundHover transition-[background,transform] duration-100 hover:scale-105"
                           ].join(" ")}>
                            {t("discover.movie")}
                        </a>
                        <a type="button" href="?type=tv"
                           onClick={movieType === "tv" ? (event) => {
                               event.preventDefault();
                           } : undefined}
                           className={[
                               "flex items-center space-x-2 rounded-full px-4 text-white py-2",
                               movieType === "tv" ? "bg-pill-background bg-opacity-50 cursor-not-allowed" : "hover:bg-pill-backgroundHover transition-[background,transform] duration-100 hover:scale-105"
                           ].join(" ")}>
                            {t("discover.series")}
                        </a>
                    </div>
                    <button type="button"
                            onClick={() => navigate(
                                randomMovie()
                            )}
                            className="flex items-center space-x-2 rounded-full px-4 text-white py-2 bg-pill-background bg-opacity-50 hover:bg-pill-backgroundHover transition-[background,transform] duration-100 hover:scale-105 dice-btn">
                        <div className="flex items-center">
                            <div>{t("discover.random_watch")}</div>
                            <img src="/lightbar-images/dice.svg" alt="Small Image" className="ml-3 dice-image" />
                        </div>
                    </button>
                </div>
                {/* 电影 */}
                <div className="flex flex-col md:flex-row md:space-x-10">
                    <div className="w-full md:w-[70%] space-y-8">
                        <div>
                            <h2 className="text-2xl cursor-default font-bold text-white sm:text-3xl md:text-2xl mx-auto pb-6">
                                {t("discover.now_playing")} 🔥
                            </h2>
                            <Splide hasTrack={false}
                                    options={{ rewind: true, drag: true, gap: "1em", pagination: false }}
                                    aria-label="React Splide Example">
                                {renderArrow()}
                                <SplideTrack className="md:!pr-[30%]">
                                    {loading ? (
                                        Array.from({ length: 2 }).map((temp, index) => (
                                            <SplideSlide key={index}>
                                                <div
                                                    className="aspect-[16/9] animate-pulse bg-pill-background opacity-10 rounded-lg"></div>
                                            </SplideSlide>
                                        ))
                                    ) : (
                                        data?.now_playing.map((movie) => (
                                            <SplideSlide key={movie.id}>
                                                <div className="relative aspect-[16/9]">
                                                    <img src={movie.backdrop_path?backdropUrl(movie.backdrop_path):"/placeholder-backdrop.png"}
                                                         alt={movie.title || movie.name}
                                                         className="rounded-lg" />
                                                    <div className="absolute inset-0 flex flex-nowrap bg-[#00000030] hover:bg-[#00000060] duration-300 rounded-lg">
                                                        <div className="w-[46%] h-full flex items-center justify-center py-5 sm:py-8">
                                                            <img
                                                                className="rounded-lg object-cover object-top w-auto max-h-full"
                                                                src={posterUrl(movie.poster_path)}
                                                                alt={movie.title || movie.name} />
                                                        </div>
                                                        <div className="w-[64%] py-6 sm:py-8 pr-5 flex items-end">
                                                            <div>
                                                            <h3 className="text-gray-100 font-semibold text-2xl pb-2.5 text-ellipsis">{movie.title||movie.name}</h3>
                                                            <p className="text-gray-200 text-xs pb-2.5">2022  |动作 冒险</p>
                                                            <p className="text-gray-200 text-xs hidden leading-6 lg:line-clamp-3 mb-2.5">{movie.overview}</p>
                                                            <div className="flex gap-3 mb-2.5">
                                                                <div className="rounded-sm px-3 py-1 text-white text-xs bg-[#00000050]">喜剧</div>
                                                                <div className="rounded-sm px-3 py-1 text-white text-xs bg-[#00000050]">犯罪</div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <a href={`/media/tmdb-${movieType}-${movie.id}-${movie.title || movie.name}`}
                                                                    className="h-[43px] w-[43px] rounded-full bg-white text-gray-900 hover:bg-gray-200 duration-200 hover:scale-105 flex justify-center items-center">
                                                                    <Icon icon={Icons.PLAY} className="text-lg"></Icon>
                                                                </a>
                                                                <a href="#" className="h-[43px] text-sm font-semibold text-white bg-[#00000050] border-[1px] rounded-full px-5 flex justify-center items-center duration-200 hover:scale-105">
                                                                    More&nbsp;<span className="hidden lg:inline-block">Info&nbsp;</span> <span aria-hidden="true">→</span>
                                                                </a>
                                                            </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SplideSlide>
                                        ))
                                    )}
                                </SplideTrack>
                            </Splide>
                        </div>
                        <div>
                            <h2 className="text-2xl cursor-default font-bold text-white sm:text-3xl md:text-2xl mx-auto pb-6">
                                {t("discover.popular")} ⭐️
                            </h2>
                            <Splide hasTrack={false} options={{
                                rewind: true,
                                drag: true,
                                gap: ".5em",
                                pagination: false,
                                perPage: 5,
                                breakpoints: {
                                    768: {
                                        perPage: 3
                                    }
                                }
                            }} aria-label="React Splide Example">
                                {renderArrow()}
                                <SplideTrack>
                                    {loading ? (
                                        Array.from({ length: 6 }).map((temp, index) => (
                                            <SplideSlide key={index}>
                                                <div
                                                    className="aspect-[2/3] animate-pulse bg-pill-background opacity-10 rounded-lg"></div>
                                            </SplideSlide>
                                        ))
                                    ) : (
                                        data?.popular.map((movie) => (
                                            <SplideSlide key={movie.id}>
                                                <a className="aspect-[2/3] transition-all duration-300 ease hover:scale-[0.99] block"
                                                   href={`/media/tmdb-${movieType}-${movie.id}-${movie.title || movie.name}`}>
                                                    <img
                                                        src={movie.poster_path ? posterUrl(movie.poster_path) : "/placeholder-poster.png"}
                                                        alt={movie.title || movie.name}
                                                        className="rounded-lg" />
                                                    <h3 className="text-[13.5px] font-semibold text-white overflow-x-hidden whitespace-nowrap overflow-ellipsis pt-1">{movie.title || movie.name}</h3>
                                                </a>
                                            </SplideSlide>
                                        ))
                                    )}
                                </SplideTrack>
                            </Splide>
                        </div>
                        <div>
                            <h2 className="text-2xl cursor-default font-bold text-white sm:text-3xl md:text-2xl mx-auto pb-6">
                                {t("discover.top_rated")}
                            </h2>
                            <Splide hasTrack={false} options={{
                                rewind: true,
                                drag: true,
                                gap: "1em",
                                pagination: false,
                                perPage: 2
                            }} aria-label="React Splide Example">
                                {renderArrow()}
                                <SplideTrack>
                                    {loading ? (
                                        Array.from({ length: 3 }).map((temp, index) => (
                                            <SplideSlide key={index}>
                                                <div
                                                    className="aspect-[16/9] animate-pulse bg-pill-background opacity-10 rounded-lg"></div>
                                            </SplideSlide>
                                        ))
                                    ) : (
                                        data?.top_rated.map((movie) => (
                                            <SplideSlide key={movie.id}>

                                                <a className="aspect-[16/9] transition-all duration-300 ease hover:scale-[0.99] block"
                                                   href={`/media/tmdb-${movieType}-${movie.id}-${movie.title || movie.name}`}>
                                                    <img src={movie.backdrop_path?backdropUrl(movie.backdrop_path):"/placeholder-backdrop.png"}
                                                         alt={movie.title || movie.name}
                                                         className="rounded-lg" />
                                                    <h3 className="text-[13.5px] font-semibold text-white overflow-x-hidden whitespace-nowrap overflow-ellipsis pt-1">{movie.title || movie.name}</h3>
                                                </a>
                                            </SplideSlide>
                                        ))
                                    )}
                                </SplideTrack>
                            </Splide>
                        </div>
                        <div>
                            <Tab.Group>
                                {/* 标题和面板控件 */}
                                <div className="pb-6 flex justify-between items-center gap-5">
                                    <h2 className="text-2xl cursor-default font-bold text-white sm:text-3xl md:text-2xl flex-shrink-0">
                                        {t("discover.watch_providers")}
                                    </h2>
                                    <Tab.List className="flex gap-4 overflow-x-auto watch_providers">
                                        {Object.keys(watchProviders).map(providerName => (
                                            <Tab key={watchProviders[providerName]}
                                                 className={({ selected }) =>
                                                     [
                                                         "rounded-full py-1 px-3 text-sm/6 font-semibold text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white flex-shrink-0",
                                                         selected ? "bg-white/10 data-[hover]:bg-white/10" : ""
                                                     ].join(" ")
                                                 }>
                                                {providerName}
                                            </Tab>
                                        ))}
                                    </Tab.List>
                                </div>

                                {/* 内容面板 */}
                                <Tab.Panels>
                                    {
                                        Object.keys(watchProviders).map(providerName => (
                                            <Tab.Panel key={watchProviders[providerName]}>
                                                <Splide hasTrack={false} options={{
                                                    rewind: true,
                                                    drag: true,
                                                    gap: "1em",
                                                    pagination: false,
                                                    perPage: 5,
                                                    breakpoints: {
                                                        768: {
                                                            perPage: 3
                                                        }
                                                    }
                                                }} aria-label="React Splide Example">
                                                    {renderArrow()}
                                                    <SplideTrack>
                                                        {loading ? (
                                                            // 骨架屏
                                                            Array.from({ length: 6 }).map((temp, index) => (
                                                                <SplideSlide key={index}>
                                                                    <div
                                                                        className="aspect-[2/3] animate-pulse bg-pill-background opacity-10 rounded-lg"></div>
                                                                </SplideSlide>
                                                            ))
                                                        ) : (
                                                            data?.watch_providers[providerName as keyof Providers].map((movie) => (
                                                                <SplideSlide key={movie.id}>
                                                                    <a className="aspect-[2/3] transition-all duration-300 ease hover:scale-[0.99] block"
                                                                       href={`/media/tmdb-${movieType}-${movie.id}-${movie.title || movie.name}`}>
                                                                        <img src={movie.poster_path?posterUrl(movie.poster_path):'/placeholder-poster.png'}
                                                                             alt={movie.title}
                                                                             className="rounded-lg" />
                                                                        <h3 className="text-[13.5px] font-semibold text-white overflow-x-hidden whitespace-nowrap overflow-ellipsis pt-1">{movie.title || movie.name}</h3>
                                                                    </a>
                                                                </SplideSlide>
                                                            ))
                                                        )
                                                        }
                                                    </SplideTrack>
                                                </Splide>
                                            </Tab.Panel>
                                        ))
                                    }
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    </div>
                    <div className="relative w-full md:w-[30%] space-y-8 md:pt-0 pt-8 md:min-h-full">
                        <div className="md:absolute md:inset-0">
                            <h2 className="text-2xl cursor-default font-bold text-white sm:text-3xl md:text-2xl mx-auto pb-6">
                                {t("discover.upcoming")} 🍿
                            </h2>
                            <div className="h-full md:overflow-y-auto incoming">
                                {loading ? (
                                    Array.from({ length: 2 }).map((temp, index) => (
                                        <div key={index} className="mb-4">
                                            <div
                                                className="aspect-[16/9] animate-pulse bg-pill-background opacity-10 rounded-lg mb-2"></div>
                                            <div
                                                className="h-4 w-2/3 animate-pulse bg-pill-background opacity-10 rounded-lg mb-2"></div>
                                            <div
                                                className="h-2 w-100 animate-pulse bg-pill-background opacity-10 rounded-lg mb-2"></div>
                                            <div
                                                className="h-2 w-100 animate-pulse bg-pill-background opacity-10 rounded-lg mb-2"></div>
                                            <div
                                                className="h-2 w-20 animate-pulse bg-pill-background opacity-10 rounded-lg mb-2"></div>
                                        </div>
                                    ))
                                ) : (
                                    data?.upcoming.map((movie) => (
                                        <a className="aspect-[16/9] transition-all duration-300 ease hover:scale-[0.99] block mb-4"
                                           href={`/media/tmdb-${movieType}-${movie.id}-${movie.title || movie.name}`}>
                                            <img src={movie.backdrop_path?backdropUrl(movie.backdrop_path):'/placeholder-backdrop.png'} alt={movie.title || movie.name}
                                                 className="rounded-lg" />
                                            <h3 className="text-sm font-bold text-white overflow-x-hidden whitespace-nowrap overflow-ellipsis py-1.5">{movie.title||movie.name}</h3>
                                            <p className="line-clamp-3 text-gray-400 text-xs font-semibold">{movie.overview}</p>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SubPageLayout>
    );
};


export default React.memo(Discover);







