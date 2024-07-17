import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import useMarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import { Transition, TransitionGroup } from 'react-transition-group';

import './comicsList.scss';


const ComicsList = () => {

    const [comicsList, setComicsList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [comicsEnded, setComicsEnded] = useState(false);
    const [animStart, setAnimStart] = useState(false);

    const { loading, error, getAllComics } = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, [])

    const onRequest = (offset, initial) => {
        initial ? setNewItemLoading(false) : setNewItemLoading(true);
        getAllComics(offset)
            .then(onComicsListLoaded)
    }

    const onComicsListLoaded = async (newComicsList) => {
        let ended = false;
        if (newComicsList.length < 8) {
            ended = true;
        }

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (let comic of newComicsList) {
            await delay(100);
            setComicsList(comicsList => [...comicsList, comic]);
        }
        setNewItemLoading(false);
        setOffset(offset + 8);
        setComicsEnded(ended);
        setAnimStart(setAnimStart => true);
    }


    function renderItems(arr) {
        const items = arr.map((item, i) => {

            let delay = 0;
            const duration = 300;

            const defaultStyle = {
                transition: `all ${duration}ms ease-in-out`,
                opacity: 0,
                transform: 'translateY(-30%)',
                transitionDelay: `${delay}s`
            }

            const transitionStyles = {
                entering: { opacity: 0, transform: 'translateY(-10%)', transitionDelay: `${delay}s` },
                entered: { opacity: 1, transform: 'translateY(0)', transitionDelay: `${delay}s` },
                exiting: { opacity: 1, transform: 'translateY(0)', transitionDelay: `${delay}s` },
                exited: { opacity: 0, transform: 'translateY(20%)', transitionDelay: `${delay}s` },
            };
            if (i >= arr.length - 8) {
                delay += 0.5;
            }

            return (
                <Transition
                    in={animStart}
                    timeout={duration}
                    key={item.id}
                    mountOnEnter>
                    {state => (
                        <li className="comics__item" key={i}
                            style={{
                                ...defaultStyle,
                                ...transitionStyles[state]
                            }}>
                            <Link to={`/comics/${item.id}`}>
                                <img src={item.thumbnail} alt={item.title} className="comics__item-img" />
                                <div className="comics__item-name">{item.title}</div>
                                <div className="comics__item-price">{item.price}</div>
                            </Link>
                        </li>
                    )}
                </Transition>

            )
        })

        return (
            <ul className="comics__grid">
                <TransitionGroup component={null}>
                    {items}
                </TransitionGroup>
            </ul>
        )
    }

    const items = renderItems(comicsList);

    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading && !newItemLoading ? <Spinner /> : null;

    return (
        <div className="comics__list">
            {errorMessage}
            {spinner}
            {items}
            <button
                disabled={newItemLoading}
                style={{ 'display': comicsEnded ? 'none' : 'block' }}
                className="button button__main button__long"
                onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

export default ComicsList;