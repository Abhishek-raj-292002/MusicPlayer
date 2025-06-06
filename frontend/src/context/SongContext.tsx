import axios from "axios";
import React, {createContext,ReactNode,useCallback,useContext,useEffect,useState} from "react"


const server ="http://localhost:8000"

export interface Song {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    audio: string;
    album: string;
}

export interface Album {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

interface SongContextType {
    songs: Song[];
    song: Song | null;
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
    loading: boolean;
    selectedSong: string | null;
    setSelectedSong: (id: string | null) => void;
    albums: Album[];
    fetchSingleSong: () => Promise<void>;
    nextSong: () => void;
    prevSong: () => void;
}

const SongContext = createContext<SongContextType |undefined >(undefined)

interface SongProviderProps{
    children: ReactNode
}

export const SongProvider: React.FC<SongProviderProps> = ({children}) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedSong, setSelectedSong] = useState<string | null>(null);
    const [isPlaying , setIsPlaying] = useState<boolean>(false)
    const [albums, setAlbums] = useState<Album[]>([]);
    const [song,setsong] = useState<Song | null>(null)


    const fetchSongs=useCallback (async() => {
        setLoading(true)
        try{
            const {data} = await axios.get<Song[]>(`${server}/api/v1/song/all`)
            setSongs(data)
            if(data.length > 0){
                setSelectedSong(data[0].id.toString())
                setIsPlaying(false)
            }
        }catch(error){
            console.error("Error fetching songs:", error)
        }finally{
            setLoading(false)
        }
        
    },[]);

    const fetchSingleSong = useCallback( async()=>{
        if(!selectedSong) return;
        try{
            const {data} = await axios.get<Song>(`${server}/api/v1/song/${selectedSong}`)
            setsong(data)
        }catch(error){
            console.error("Error fetching single song:", error)
        }
    },[selectedSong]);

    const fetchAlbums=useCallback (async() => {
        setLoading(true)
        try{
            const {data} = await axios.get<Album[]>(`${server}/api/v1/album/all`)
            setAlbums(data)
        }catch(error){
            console.error("Error fetching albums:", error)
        }finally{
            setLoading(false)
        }
        
    },[]);

    const [index, setIndex] = useState<number>(0);
    const nextSong = useCallback(() => {
        if (index === songs.length-1){
            setIndex(0);
            setSelectedSong(songs[0].id.toString());
            return;
        }else{
            setIndex((prevIndex) => prevIndex + 1);
            setSelectedSong(songs[index + 1].id.toString());
        }
    }, [songs, index]);

    const prevSong = useCallback(() => {
        if (index === 0){
            setIndex(songs.length-1);
            setSelectedSong(songs[songs.length-1].id.toString());
            return;
        }else{
            setIndex((prevIndex) => prevIndex - 1);
            setSelectedSong(songs[index - 1].id.toString());
        }
    }, [songs, index]);

    useEffect(()=>{
        fetchSongs();
        fetchAlbums();
    },[])
    return (
        <SongContext.Provider value={{
        songs,
        selectedSong,
        setSelectedSong,
        loading,
        isPlaying,
        setIsPlaying,
        albums,
        fetchSingleSong,
        song,
        nextSong,
        prevSong
        }}>
            {children} 
        </SongContext.Provider>
    )
}

export const useSongData = (): SongContextType => {
    const context = useContext(SongContext)
    if (!context) {
        throw new Error("useSongData must be used within a SongProvider")
    }
    return context
}