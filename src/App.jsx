import { Children, useEffect, useState } from "react";
import { allCharacters } from "../data/data";
import "./App.css";
import CharacterDetail from "./components/CharacterDetail";
import CharacterList from "./components/CharacterList";
import Navbar, { Favourites, Search, SearchResult } from "./components/Navbar";
import Loader from "./components/Loader";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Modal from "./components/Modal";

function App(){
  const [characters, setCharecters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [favourites, setFavourites] = useState(
    () => JSON.parse(localStorage.getItem("FAVOURITES")) || []
  );
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal
    async function fetchData() {
     try {
      setIsLoading(true);
      const { data } = await axios.get(
        `https://rickandmortyapi.com/api/character?name=${query}`
        , { signal }
      );
      setCharecters(data.results.slice(0,5));
      // setIsLoading(false);
     } catch (err) {
      if (!axios.isCancel()) {
        setCharecters([]);
        toast.error(err.response.data.error);
      }
     }finally{
      setIsLoading(false);
     }
    }

    // if(query.length < 3) {
    //   setCharecters([]);
    //   return;
    // }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    localStorage.setItem("FAVOURITES", JSON.stringify(favourites));
  },[favourites]);

  const handleSelectCharacter = (id) => {
    setSelectedId(prevId => prevId === id ? null : id);
  };

  const handleAddFavourite = (char) => {
    setFavourites((preFav) => [...preFav, char]);
  };

  const handleDeleteFavourite = (id) => {
    setFavourites((preFav) => preFav.filter((fav) => fav.id !== id));
  };

  const isAddToFavourite = favourites.map((fav) => fav.id).includes(selectedId);

  return (
    <div className="app">
      <Toaster />
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <SearchResult numOfResult={characters.length}/>
        <Favourites favourites={favourites} onDeleteFavourite={handleDeleteFavourite} />
      </Navbar>
      <Main>
        <CharacterList 
          selectedId={selectedId}
          characters={characters} 
          isLoading={isLoading} 
          onSelectCharacter={handleSelectCharacter} 
        />
        <CharacterDetail 
          selectedId={selectedId} 
          onAddFavourite={handleAddFavourite} 
          isAddToFavourite={isAddToFavourite}
        />
      </Main>
    </div>
  );
}
export default App;

function Main({ children }) {
  return <div className="main">{children}</div>;
}