import {Composition} from 'remotion';
import {MushroomTrailer} from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="MushroomKingdom" component={MushroomTrailer} durationInFrames={2700} fps={30} width={1280} height={720}/>
    </>
  );
};
