import {Still} from 'remotion';
import {YoshiPhoto} from './YoshiPhoto';
import {Composition} from 'remotion';
import {MushroomTrailer} from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still id="YoshiFront" component={YoshiPhoto} width={1280} height={720} defaultProps={{yaw:0,blink:false}}/>
      <Still id="YoshiBack" component={YoshiPhoto} width={1280} height={720} defaultProps={{yaw:2.4,blink:false}}/>
      <Still id="YoshiBlink" component={YoshiPhoto} width={1280} height={720} defaultProps={{yaw:0,blink:true}}/>
      <Composition id="MushroomKingdom" component={MushroomTrailer} durationInFrames={2700} fps={30} width={1280} height={720}/>
    </>
  );
};
