/* Visual snapshots only. The real CV remains the source of text, layout and actions. */
const properties = [
  'display','box-sizing','width','height','min-width','max-width','min-height','max-height',
  'position','top','right','bottom','left','padding-top','padding-right','padding-bottom','padding-left',
  'margin-top','margin-right','margin-bottom','margin-left','gap','row-gap','column-gap',
  'grid-template-columns','grid-template-rows','grid-column','grid-row','align-items','align-self','justify-content',
  'flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','order','vertical-align',
  'background-color','background-image','background-size','background-position','background-clip',
  'border-top','border-right','border-bottom','border-left','border-radius','box-shadow',
  'color','font-family','font-size','font-weight','font-style','font-variant','font-stretch','font-kerning','font-feature-settings','font-variation-settings','line-height','letter-spacing',
  'text-align','text-transform','text-decoration','text-shadow','white-space','word-break','overflow-wrap',
  'overflow','object-fit','object-position','aspect-ratio','-webkit-text-fill-color'
];

export function visualCopy(source, empty = false) {
  function copy(original) {
    if (original.nodeType === Node.TEXT_NODE) return document.createTextNode(original.textContent);
    if (!(original instanceof Element)) return document.createTextNode('');
    let clone;
    if (original instanceof HTMLCanvasElement) {
      clone = document.createElement('img');
      try { clone.src = original.toDataURL(); } catch { /* A decorative canvas may be omitted. */ }
    } else clone = original.cloneNode(false);
    for (const attribute of [...clone.attributes]) {
      if (attribute.name === 'id' || attribute.name === 'class' || attribute.name === 'style' || attribute.name.startsWith('on') || attribute.name.startsWith('data-')) clone.removeAttribute(attribute.name);
    }
    if (clone.matches?.('a,button,input,textarea,select,[tabindex]')) clone.setAttribute('tabindex','-1');
    const style = getComputedStyle(original);
    for (const property of properties) clone.style?.setProperty(property, style.getPropertyValue(property));
    if (clone.style) {
      clone.style.opacity = '1'; clone.style.transform = 'none'; clone.style.filter = 'none';
      clone.style.visibility = 'visible'; clone.style.animation = 'none'; clone.style.transition = 'none';
      clone.style.pointerEvents = 'none';
    }
    if (original instanceof HTMLImageElement) clone.src = original.currentSrc || original.src;
    if (!empty) for (const child of original.childNodes) clone.append(copy(child));
    return clone;
  }
  const clone = copy(source), r = source.getBoundingClientRect();
  clone.classList.add('swarm-copy'); clone.inert = true;
  Object.assign(clone.style, {position:'absolute',left:'0',top:'0',margin:'0',width:`${r.width}px`,height:`${r.height}px`,minWidth:'0',maxWidth:'none',maxHeight:'none'});
  return clone;
}

export function describeSource(source) {
  const parts = [{element:source,kind:'frame',empty:true}];
  const selectors = source.matches('.pcard')
    ? ['.pcard__img','.pcard__cat','h3','.pcard__txt > p','.tags','.dossier-trigger']
    : source.matches('.credential')
      ? ['.credential-frame','.credential-index','strong']
      : source.matches('.sk') ? ['h3','ul']
      : source.matches('.pub') ? ['.y','h4','.au','.vn','.pub__aw']
      : ['h3','h4','.xcard__yr','.org','.dept','.yr','p','.loc','.gpa','.award__top','.award__venue','.award__row','.award__org'];
  const selected = selectors.flatMap(selector => [...source.querySelectorAll(selector)]).filter(element => {
    const r = element.getBoundingClientRect();return r.width > 3 && r.height > 3;
  });
  const topLevel = selected.filter(element => !selected.some(other => other !== element && other.contains(element)));
  if (!topLevel.length) return [{element:source,kind:source.matches('h1,h2,p')?'text':'box'}];
  return parts.concat(topLevel.slice(0,9).map(element => ({element,kind:element.matches('.pcard__img,.credential-frame')?'image':element.matches('.tags,ul,.award__top,.award__row,.dossier-trigger')?'box':'text'})));
}

export function introBlueprint() {
  const definitions = [
    ['#nav','frame'],['.nav__brand','text'],['#navLinks','box'],['.nav__right','box'],
    ['#hero-eyebrow','text'],['#heroName','text'],['#heroHead','text'],
    ['#heroRoles','box'],['.hero__ph','image'],['#hero-actions','box'],
    ['.map-heading','text'],['.research-track:nth-of-type(1)','text'],
    ['.research-track:nth-of-type(2)','text'],['.research-track:nth-of-type(3)','text'],
    ['#portrait-caption','text'],['#heroMeta','box'],['.reading-dock','box']
  ];
  return definitions.map(([selector,kind])=>({element:document.querySelector(selector),kind,empty:kind==='frame'}))
    .filter(({element})=>{if(!element)return false;const r=element.getBoundingClientRect();return r.width>2&&r.height>2&&r.top<innerHeight&&r.bottom>0;});
}
