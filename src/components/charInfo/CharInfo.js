import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useMarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import Skeleton from '../skeleton/Skeleton';
import { Transition, TransitionGroup } from 'react-transition-group';
import './charInfo.scss';


const CharInfo = (props) => {

    const [char, setChar] = useState(null);
    const [animRanStart, setAnimRanStart] = useState(false);

    const { loading, error, getCharacter, clearError } = useMarvelService();

    useEffect(() => {
        updateChar();
    }, [props.charId])

    const updateChar = () => {
        const { charId } = props;
        if (!charId) {
            return;
        }

        clearError();
        getCharacter(charId)
            .then(onCharLoaded)
    }

    const onCharLoaded = (char) => {
        setChar(char);
        setAnimRanStart(true);
    }

    const skeleton = char || loading || error ? null : <Skeleton />;
    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading ? <Spinner /> : null;
    const content = !(loading || error || !char) ? <View char={char} animRanStart={animRanStart} /> : null;

    return (
        <TransitionGroup>
            <div className="char__info">
                {skeleton}
                {errorMessage}
                {spinner}
                {content}
            </div>
        </TransitionGroup>

    )
}

const View = ({ char, animRanStart }) => {
    const { name, decoration, thumbnail, homepage, wiki, comics } = char;

    let imgStyle = { 'objectFit': 'cover' };
    if (thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
        imgStyle = { 'objectFit': 'contain' };
    }

    let delay = 0;
    const duration = 400;

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

    return (
        <Transition
            in={animRanStart} timeout={duration} key={char.id}>
            {state => (
                <>
                    <div className="char__basics"
                        style={{
                            ...defaultStyle,
                            ...transitionStyles[state]
                        }}
                    >
                        <img src={thumbnail} alt={name} style={imgStyle} />
                        <div>
                            <div className="char__info-name">{name}</div>
                            <div className="char__btns">
                                <a href={homepage} className="button button__main">
                                    <div className="inner">homepage</div>
                                </a>
                                <a href={wiki} className="button button__secondary">
                                    <div className="inner">Wiki</div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="char__descr">
                        {decoration}
                    </div>
                    <div className="char__comics">Comics:</div>
                    <ul className="char__comics-list" style={{
                        ...defaultStyle,
                        ...transitionStyles[state]
                    }}>
                        {comics.length > 10 ? null : 'There is no comics with this character'}
                        {
                            comics.map((item, i) => {
                                // eslint-disable-next-line 
                                if (i > 9) return;
                                return (
                                    <li key={i} className="char__comics-item">
                                        {item.name}
                                    </li>
                                )
                            })
                        }

                    </ul>
                </>
            )}
        </Transition>

    )
}

CharInfo.propTypes = {
    charId: PropTypes.number
}

export default CharInfo;