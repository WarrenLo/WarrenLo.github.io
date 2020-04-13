var app = new Vue({
	el: '#app',
	data: {
      canvas: null,
      canvasSize: {
        width: 300,
        height: 300
      },
      activeObj: null,
      activeObjData: null,
      activeObjId: null,
      allDatas: [],
      currentData: {
        id: null,
        svgPath: []
      },
      mouse: {
        down: false,
        dragging: false,
        position: { x: 0, y: 0 }
      },
      mode: 'hand',
      modeOptions: [
        {
          type: 'hand',
          font: 'Hand'
        },
        {
          type: 'bezierCurve',
          font: 'Bezier Curve'
        },
        {
          type: 'line',
          font: 'Line'
        },
        {
          type: 'detect',
          font: 'Detect'
        }
      ]
  },
  watch: {
    activeObjId: {
      immediate: false,
      deep: true,
      handler: function(newValue, oldValue) {
        this.removeObjectByName('bezierPoint');
        this.removeObjectByName('line');  
        this.activeObj = this.findObjectById(newValue);
        this.activeObjData = this.findObjectDataById(newValue);
        if (this.activeObj) this.activeObj.set('stroke', 'blue');
        if (oldValue) {
          const oldObj = this.findObjectById(oldValue);
          if (!oldObj) return;
          const oldObjData = this.findObjectDataById(oldValue);
          if (oldObjData.showNodes) oldObjData.showNodes = false;
          oldObj.set('stroke', 'black');
        }
      }
    },
    mode: {
      immediate: false,
      deep: true,
      handler: function(newValue, oldValue) {  
        this.activeObjId = null;
        this.removeObjectByName('customCursor');
        this.removeObjectByName('previewPath');
        this.removeObjectByName('bezierPoint');
        this.removeObjectByName('line');      
        if (newValue === 'hand') {
          this.currentData.svgPath = [];
          this.currentData.id = null;
        }
      }
    }
  },
  mounted() {
    this.canvasSize.width = window.innerWidth * 0.95;
    this.canvasSize.height = window.innerHeight * 0.7;
    this.initCanvas();
  },
  methods: {
    switchMode(mode) {
      this.mode = mode;
    },
    initCanvas() {
      this.canvas = new fabric.Canvas('canvas', {
        width: this.canvasSize.width,
        height: this.canvasSize.height,    
        backgroundColor: '#eeeeec',
        selection: false
      });
      this.canvas.on({
        'mouse:down': this.mousedown,
        'mouse:up': this.mouseup,
        'mouse:dblclick': this.mousedblclick,
        'mouse:wheel': this.mousewheel,
        'mouse:move': this.mousemove,
        'mouse:out': this.mouseout
      });
    },
    mouseout(option) {
      this.removeObjectByName('previewPath');
      this.removeObjectByName('customCursor');
    },
    mousedown(option) {
      this.mouse.down = true;
      switch (this.mode) {
        case 'hand': {
          if (!option.target) this.activeObjId = null;
          break;
        }
        case 'bezierCurve': {
          this.recordBezierCurveData(option);
          this.drawPath({ svgPath: this.currentData.svgPath, stroke: 'blue' });
          break;
        }
        case 'line': {
          this.recordBezierCurveData(option);
          this.drawPath({ svgPath: this.currentData.svgPath, stroke: 'blue' });
          break;
        }
      }
    },
    mouseup(option) {
      this.mouse.down = false;
      this.mouse.dragging = false;
    },
    mousedblclick(option) {
    },
    mousewheel(option) {
    },    
    mousemove(option) {
      if (this.mouse.down) this.mouse.dragging = true;
      switch (this.mode) {
        case 'hand': {
          break;
        }
        case 'bezierCurve': {
          let { x, y } = option.absolutePointer;
          if (this.currentData.svgPath.length > 1) {
            const firstPoint = this.currentData.svgPath[0];
            const point = { x: firstPoint.points[0], y: firstPoint.points[1] };
            const dist = this.calDistBetweenTwoPoints({ x, y }, point);
            if (dist < 5) {
              x = point.x;
              y = point.y;
              this.finish = true;
            } else this.finish = false;
          }
          this.recordMousePosition({ x, y });
          this.customCursor();
          this.updateBezierCurveData();
          this.drawPreviewPath();
          break;
        }
        case 'line': {
          let { x, y } = option.absolutePointer;
          this.recordMousePosition({ x, y });
          this.customCursor();
          this.drawPreviewPath();
          break;
        }
        case 'detect': {
          let { x, y } = option.absolutePointer;
          this.recordMousePosition({ x, y });
          this.detectObj();
          this.customCursor();
          break;
        }
        default:
          break;
      }
    },
    detectObj() {
      let distMin = 5;
      let detected = { point: null, id: null };
      this.allDatas.forEach(data => {
        data.buffer.forEach(b => {
          const dist = this.calDistBetweenTwoPoints(b, this.mouse.position);
          if (dist < distMin) {
            detected.point = b;
            detected.id = data.id;
          }
        })
      })
      if (detected.id) {
        this.activeObjId = detected.id;
        this.recordMousePosition(detected.point);
      } else this.activeObjId = null;
    },
    keydown(option) {
      switch (option.code) {
        case 'Escape': {
          this.updateAllData();
          this.activeObjId = null;
          this.switchMode('hand');
          break;
        }
        case 'Delete': {
          this.deleteObj(this.activeObjId);
        }
      }
    },
    deleteObj(id) {
      if (!id) return;
      this.removeObjectById(id);
      this.removeDataById(id);
      this.activeObjId = null;
    },
    removeObjectById(id) {
      const removeObjs = this.canvas._objects.filter(obj => obj.id === id);
      removeObjs.forEach(obj => this.canvas.remove(obj));
    },
    removeDataById(id) {
      this.allDatas = this.allDatas.filter(data => data.id !== id);
    },
    updateAllData() {
      if (this.currentData.svgPath.length < 1 || !this.currentData.id) return;
      this.removeObjectByName('bezierPoint');
      this.removeObjectByName('bezierCurve');
      const data = _.cloneDeep(this.currentData);
      data.mode = this.mode;
      if (data.mode === 'line') data.length = this.calPathLength(data.svgPath);
      this.allDatas.push(data);
      this.currentData.svgPath.length = 0;
      this.currentData.id = null;
      this.allDatas.forEach(data => {
        this.drawPath({ svgPath: data.svgPath, id: data.id, name: `allPath_${data.id}` });
        data.buffer = this.calAllBezierPoints(data.svgPath);
      })
      this.finish = false;
    },
    calDistBetweenTwoPoints(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    },
    calPathLength(path) {
      const startPoint = path[0];
      const endPoint = path[path.length - 1];
      const p1 = {
        x: startPoint.points[this.pointPosition(startPoint).x],
        y: startPoint.points[this.pointPosition(startPoint).y]
      };
      const p2 = {
        x: endPoint.points[this.pointPosition(endPoint).x],
        y: endPoint.points[this.pointPosition(endPoint).y]
      }
      return this.calDistBetweenTwoPoints(p1, p2).toFixed(2);
    },
    updateBezierCurveData() {
      if (!this.mouse.dragging) return;
      if (this.currentData.svgPath.length < 2) return;
      const lastData = this.currentData.svgPath[this.currentData.svgPath.length - 1];
      lastData.points[this.pointPosition(lastData).c2x] = 2 * lastData.points[this.pointPosition(lastData).x] - this.mouse.position.x // x
      lastData.points[this.pointPosition(lastData).c2y] = 2 * lastData.points[this.pointPosition(lastData).y] - this.mouse.position.y // y
      this.bezierCurveCreator.controlPoint.x = this.mouse.position.x;
      this.bezierCurveCreator.controlPoint.y = this.mouse.position.y;
      this.drawPath({ svgPath: this.currentData.svgPath, stroke: 'blue' });
    },
    recordMousePosition({ x, y }) {
      this.mouse.position = { x, y };
    },
    customCursor() {
      this.removeObjectByName('customCursor');
      this.cursor = new fabric.Circle({
        name: 'customCursor',
        top: this.mouse.position.y,
        left: this.mouse.position.x,
        radius: 5,
        fill: 'transparent',
        stroke: 'blue',
        strokeWidth: 1,
        selectable: false,
        hasBorder: false,
        hasControls: false,
        hoverCursor: 'defalut',
        originX: 'center',
        originY: 'center'
      });
      this.canvas.add(this.cursor);
    },
    recordBezierCurveData(option) {
      const { x, y } = this.mouse.position;
      let data = {};
      if (this.currentData.svgPath.length === 0) {
        data = {
          type: 'M',
          points: [x, y]
        };
        this.currentData.id = new Date().valueOf();
      } else if (this.mode === 'bezierCurve') {
        data = {
          type: 'C',
          points: [this.bezierCurveCreator.controlPoint.x, this.bezierCurveCreator.controlPoint.y, x, y, x, y]
        };
      } else if (this.mode === 'line') {
        data = {
          type: 'L',
          points: [x, y]
        };
        this.finish = true;
      }
      this.currentData.svgPath.push(data);
      this.bezierCurveCreator = {
        startPoint: { x, y },
        controlPoint: { x, y }
      };
      this.drawPoint({ x, y });
      if (this.finish) this.updateAllData();
    },
    drawBezierPoint({ x, y, stroke, fill, radius, info, movingFun, movedFun }) {
      const bezierPoint = this.drawPoint({ x, y, stroke, fill, radius, add: false });
      bezierPoint.info = info;
      bezierPoint.on('moving', movingFun);
      bezierPoint.on('moved', movedFun);
      this.canvas.add(bezierPoint);
    },
    drawPoint({ x, y, stroke = 'grey', fill = 'white', radius = 4, name = 'bezierPoint', add = true }) {
      const point = new fabric.Circle({
        name,
        top: y,
        left: x,
        radius,
        stroke,
        fill,
        selectable: true,
        hasBorder: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'default'
      });
      if (add) this.canvas.add(point);
      return point;
    },
    drawPath({ svgPath, id, name = 'bezierCurve', stroke = 'black'}) {
      if (svgPath.length < 1) return;
      this.removeObjectByName(name);
      const path = this.convertSvgDataIntoPath(svgPath);
      const bezierCurve = new fabric.Path(path, {
        id,
        name,
        stroke,
        fill: 'transparent',
        selectable: true,
        hasControls: false,
        hoverCursor: 'default'
      });
      bezierCurve.on('mousedblclick', this.mousedblclickObj.bind(this));
      bezierCurve.on('mousedown', this.mousedownObj.bind(this));
      bezierCurve.on('moved', this.movedObj.bind(this));
      bezierCurve.on('moving', this.movingObj.bind(this));
      this.canvas.add(bezierCurve);
      bezierCurve.sendToBack();
    },
    movingObj(option) {
      if (!option.target) return;
      this.removeObjectByName('bezierPoint');
      this.removeObjectByName('line');
    },
    mousedblclickObj(option) {
      if (!option.target) return;
      const targetData = this.findObjectDataById(option.target.id);
      targetData.showNodes = true;
      this.renderNodes(targetData);
      this.canvas._activeObject = null;
    },
    mousedownObj(option) {
      if (!option.target) return;
      this.activeObjId = this.canvas._activeObject ? this.canvas._activeObject.id : null;
      this.movement = { x: option.target.left, y: option.target.top };
    },
    movedObj(option) {
      if (!option.target) return;
      this.movement.x = option.target.left - this.movement.x;
      this.movement.y = option.target.top - this.movement.y;
      const targetData = this.findObjectDataById(option.target.id);
      targetData.svgPath.forEach(path => {
        path.points.forEach((point, index) => {
          path.points[index] += index % 2 === 0 ? this.movement.x : this.movement.y;
        })
      })
      if (targetData.showNodes) this.renderNodes(targetData);
      targetData.buffer = this.calAllBezierPoints(targetData.svgPath);
    },
    renderNodes({ svgPath, id }) {
      this.removeObjectByName('bezierPoint');
      this.removeObjectByName('line');
      svgPath.forEach((path, indexPath, svgPath) => {
        const info = {
          id,
          type: path.type,
          indexPath
        };
        switch (path.type) {
          case 'M':
          case 'L':
            path.points.forEach((point, indexPoint) => {
              if (indexPoint % 2 === 1) {
                this.drawBezierPoint({
                  x: path.points[indexPoint - 1],
                  y: point,
                  info: { ...info, indexPoint: indexPoint - 1 },
                  movingFun: this.movingTerminalPoint.bind(this),
                  movedFun: this.movedTerminalAndControlPoint.bind(this)
                });
              }
            });
            break;
          case 'C':
            path.points.forEach((point, indexPoint) => {
              if (indexPoint % 2 === 1) {
                if (indexPath !== 0) {
                  if (indexPoint === 1) {
                    const prevPath = svgPath[indexPath - 1];
                    const prevPoint = {
                      x: prevPath.points[prevPath.points.length - 2],
                      y: prevPath.points[prevPath.points.length - 1]
                    };
                    this.drawLine({ p1: prevPoint, p2: { x: path.points[indexPoint - 1], y: point } });
                  }
                  if (indexPoint === path.points.length - 1) {
                    const prevPoint = {
                      x: path.points[indexPoint - 3],
                      y: path.points[indexPoint - 2]
                    };
                    this.drawLine({ p1: prevPoint, p2: { x: path.points[indexPoint - 1], y: point } });
                  }
                }
                if (indexPoint === path.points.length - 1) {
                  this.drawBezierPoint({
                    x: path.points[indexPoint - 1],
                    y: point,
                    info: { ...info, indexPoint: indexPoint - 1 },
                    movingFun: this.movingTerminalPoint.bind(this),
                    movedFun: this.movedTerminalAndControlPoint.bind(this)
                  });
                } else {
                  this.drawBezierPoint({
                    x: path.points[indexPoint - 1],
                    y: point,
                    stroke: 'red',
                    radius: 3,
                    info: { ...info, indexPoint: indexPoint - 1 },
                    movingFun: this.movingControlPoint.bind(this),
                    movedFun: this.movedTerminalAndControlPoint.bind(this)
                  });
                }
              }
            });
            break;
        }
      });
    },
    pointPosition(path) {
      switch (path.type) {
        case 'M':
        case 'L':
          return { x: 0, y: 1 };
        case 'C':          
          return { c1x: 0, c1y: 1, c2x: 2, c2y: 3, x: 4, y: 5 };
      }
    },
    movingControlPoint(option) {
      const { info, top, left } = option.target;
      const targetData = this.findObjectDataById(info.id);
      const diff = {
        x: left - targetData.svgPath[info.indexPath].points[info.indexPoint],
        y: top - targetData.svgPath[info.indexPath].points[info.indexPoint + 1]
      };
      const targetPath = targetData.svgPath[info.indexPath];
      targetPath.points[info.indexPoint] += diff.x
      targetPath.points[info.indexPoint + 1] += diff.y
      if (info.indexPoint === 0) {
        const prevPath = targetData.svgPath[info.indexPath - 1]
        if (prevPath && prevPath.type === 'C') {
          prevPath.points[this.pointPosition(prevPath).c2x] = 2 * prevPath.points[this.pointPosition(prevPath).x] - targetPath.points[info.indexPoint];
          prevPath.points[this.pointPosition(prevPath).c2y] = 2 * prevPath.points[this.pointPosition(prevPath).y] - targetPath.points[info.indexPoint + 1];
        };
      }
      if (info.indexPoint === 2) {
        const nextPath = targetData.svgPath[info.indexPath + 1]
        if (nextPath && nextPath.type === 'C') {
          nextPath.points[this.pointPosition(nextPath).c1x] = 2 * targetPath.points[this.pointPosition(targetPath).x] - targetPath.points[info.indexPoint];
          nextPath.points[this.pointPosition(nextPath).c1y] = 2 * targetPath.points[this.pointPosition(targetPath).y] - targetPath.points[info.indexPoint + 1];
        };
      }
      this.drawPath({ svgPath: targetData.svgPath, id: targetData.id, name: `allPath_${targetData.id}`, stroke: 'blue' });
      this.renderNodes(targetData);
    },
    movingTerminalPoint(option) {
      const { info, top, left } = option.target;
      const targetData = this.findObjectDataById(info.id);
      const diff = {
        x: left - targetData.svgPath[info.indexPath].points[info.indexPoint],
        y: top - targetData.svgPath[info.indexPath].points[info.indexPoint + 1]
      };
      targetData.svgPath[info.indexPath].points[info.indexPoint] += diff.x
      targetData.svgPath[info.indexPath].points[info.indexPoint + 1] += diff.y
      targetData.svgPath[info.indexPath].points[info.indexPoint - 2] += diff.x
      targetData.svgPath[info.indexPath].points[info.indexPoint - 1] += diff.y
      const nextPath = targetData.svgPath[info.indexPath + 1];
      if (nextPath && nextPath.type === 'C') {
        nextPath.points[this.pointPosition(nextPath).c1x] += diff.x
        nextPath.points[this.pointPosition(nextPath).c1y] += diff.y
      }
      if (targetData.mode === 'line') targetData.length = this.calPathLength(targetData.svgPath);
      this.drawPath({ svgPath: targetData.svgPath, id: targetData.id, name: `allPath_${targetData.id}`, stroke: 'blue' });
      this.renderNodes(targetData);
    },
    movedTerminalAndControlPoint(option) {
      const { info } = option.target;
      const targetData = this.findObjectDataById(info.id);
      targetData.buffer = this.calAllBezierPoints(targetData.svgPath);
    },
    drawLine({ p1, p2, name = 'line', stroke = 'grey' }) {
      const line = new fabric.Line([p1.x, p1.y, p2.x, p2.y], {
        name,
        stroke, 
        selectable: false,
        hoverCursor: 'default'        
      });
      this.canvas.add(line);
    },
    findObjectDataById(id) {
      return this.allDatas.filter(data => data.id === id)[0];
    },
    findObjectById(id) {
      return this.canvas._objects.filter(data => data.id === id)[0];
    },
    drawPreviewPath() {
      if (this.currentData.svgPath.length < 1) return;
      const lastData = this.currentData.svgPath[this.currentData.svgPath.length - 1];
      let path = `
      M ${lastData.points[lastData.points.length - 2]} ${lastData.points[lastData.points.length - 1]}
      C ${this.bezierCurveCreator.controlPoint.x} ${this.bezierCurveCreator.controlPoint.y} ${this.mouse.position.x} ${this.mouse.position.y} ${this.mouse.position.x} ${this.mouse.position.y}`
      this.removeObjectByName('previewPath');
      const previewPath = new fabric.Path(path, {
        name: 'previewPath',
        stroke: '#00000080',
        fill: 'transparent',
        selectable: false,
        hoverCursor: 'default'
      });
      this.canvas.add(previewPath);
      previewPath.sendToBack();
    },
    removeObjectByName(name) {
      const removeObjs = this.canvas._objects.filter(obj => obj.name === name);
      removeObjs.forEach(obj => this.canvas.remove(obj));
    },
    convertSvgDataIntoPath(svg) {
      let path = ''
      svg.forEach(data => {
        path += `${data.type} `;
        data.points.forEach(point => {
          path += `${point} `;
        })
      });
      return path;
    },
    calAllBezierPoints(svgPath, intergral = 400) {
      const bezierAllPoints = [];
      svgPath.forEach((path, index, array) => {
        if (index === 0) return;
        if (path.type === 'Z') return;
        const prevPath = array[index - 1];
        const start = { x: null, y: null };
        const c1 = { x: null, y: null };
        const c2 = { x: null, y: null };
        const end = { x: null, y: null };
        start.x = prevPath.points[this.pointPosition(prevPath).x];
        start.y = prevPath.points[this.pointPosition(prevPath).y];
        switch (path.type) {
          case 'L': {
            end.x = path.points[0];
            end.y = path.points[1];
            break;
          }
          case 'C': {
            c1.x = path.points[0];
            c1.y = path.points[1];
            c2.x = path.points[2];
            c2.y = path.points[3];
            end.x = path.points[4];
            end.y = path.points[5];
            break;
          }
          case 'Z':
          default:
            break;
        }
        const step = 1 / intergral;
        const bezier = { x: null, y: null };
        let t = 0;
        for (t = 0; t < 1 - step; t += step) {
          if (path.type === 'C') {
            bezier.x = Math.pow((1 - t), 3) * start.x + 3 * Math.pow((1 - t), 2) * t * c1.x + 3 * (1 - t) * Math.pow(t, 2) * c2.x + Math.pow(t, 3) * end.x;
            bezier.y = Math.pow((1 - t), 3) * start.y + 3 * Math.pow((1 - t), 2) * t * c1.y + 3 * (1 - t) * Math.pow(t, 2) * c2.y + Math.pow(t, 3) * end.y;
          }
          if (path.type === 'L') {
            bezier.x = start.x * (1 - t) + end.x * t;
            bezier.y = start.y * (1 - t) + end.y * t;
          }
          bezierAllPoints.push(_.cloneDeep(bezier));
        }
      });
      return bezierAllPoints;
    },
    resize() {
      this.canvasSize.width = window.innerWidth * 0.95;
      this.canvasSize.height = window.innerHeight * 0.7;
      this.canvas.setWidth(this.canvasSize.width);
      this.canvas.setHeight(this.canvasSize.height);
      this.canvas.renderAll();
    }
  }
})

window.addEventListener('keydown', app.keydown);
window.addEventListener('resize', app.resize);