type Value = string | number;

type FilterableItem = {
    id: string,
    value: string | number, 
    selected?: boolean
}

class RangeFilter {

    props: { el: HTMLElement; 
        items: FilterableItem[]; 
        compareFunction?: (a: Value, b: Value) => Number;
        defaultSelectedValues?: Array<Value>;
        id:string;
    }

    selectedValues: Array<number>

    constructor(props:{
        id:string;
        el:HTMLElement;
        items:Array<FilterableItem>;
        compareFunction?: (a:Value, b:Value)=> Number
    }){
        this.props = {...props}
        this.render = this.render.bind(this);
        this.render();

        this.values = this.values.bind(this);
        this.getStatuses = this.getStatuses.bind(this);
        this.getCheckboxes = this.getCheckboxes.bind(this);

    }

    values(){

        let ret = Array.from(new Set(this.props.items.map(itm => itm.value)));
        ret = ret.sort();
        // if (this.props.compareFunction){
        //     ret = ret.sort(this.props.compareFunction);
        // }
        return ret;

    }

    
    getCheckboxes(){

        return this.props.el.getElementsByClassName("checkboxfilter-checkbox-input");

    }

    getStatuses(){
        let ret: {[val:string]:Boolean} = {}
        Array.from(this.getCheckboxes()).forEach((el:HTMLInputElement)=>{
            ret[el.value] = el.checked;
        });

        return ret;
    }

    render(){
        const el = this.props.el;
        
        // Add a checkbox for each value
        this.values().forEach((v: Value, idx: number)=>{
            const containerID = `${this.props.id}-value-${idx}`;
            const checkboxID = `${containerID}-checkbox`;

            // <div class="checkboxfilter-container" id="container">
            // <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">
            // <label for="vehicle1"> I have a bike</label>
            // </div>

            const containerEL:HTMLDivElement = document.createElement("div");
            containerEL.classList.add("checkboxfilter-container")
            containerEL.id = containerID;
            el.appendChild(containerEL);

            const labelEl:HTMLLabelElement = document.createElement("label");
            labelEl.setAttribute("for", checkboxID);
            
            labelEl.innerText = String(v);
            containerEL.appendChild(labelEl);

            const checkboxEl:HTMLInputElement = document.createElement("input")
            checkboxEl.classList.add("checkboxfilter-checkbox-input")
            checkboxEl.setAttribute("type", "checkbox");
            checkboxEl.setAttribute("name", String(v))
            checkboxEl.setAttribute("value", String(v))
            checkboxEl.checked = true;
            checkboxEl.id = checkboxID;
            containerEL.appendChild(checkboxEl);

            checkboxEl.addEventListener("change", (evt:InputEvent)=>{
                const event = new CustomEvent('filterUpdate', {detail:this.getStatuses()});
                el.dispatchEvent(event)
            });

        })

        console.log(this.props.el);
    }
}

export default RangeFilter;