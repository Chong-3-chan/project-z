# project-z
## 组件
### LoadingP
  加载页面。主要通过预加载以提高内容浏览的流畅度和用户体验。
#### props（待扩充） 
- fileList  
_Array&lt;Array&lt;String&gt;&gt;_  
  包含所有需要预加载资源的路径。  
    
- tips  
_Array&lt;Array&lt;Object&gt;&gt;_  
  加载页面是可以显示的 tip 的数组。其中 tip 数据存储为 Object ，有 title 和 text 属性。  
    
- destroy  
_function_  
  由app提供，在本组件完成任务后调用，用于销毁本组件和唤起等待加载完成的组件。  
  
#### state
- phase   
  阶段。阶段的变化顺序表示了加载组件的工作流程："waiting"\-&gt;"loading"\-&gt;"loaded"\-&gt;"exiting"\-&gt;"exited"  
    
  在useEffect(...,[phase])中，使用switch-case语句执行每个阶段的任务，然后在完成任务后用setPhase来推进流程；  
  phase的变动还将导致组件内各部分的style更新（phase_style_update方法）。  
    
  初始值为"waiting"，等待加载任务的载入。  
    
  有关“使用switch-case语句执行每个阶段的任务，然后在完成任务后用setPhase来推进流程”的举例解释：  
  在上面提到的switch-case中，case "waiting"分支遍历fileList并逐个创建对应的加载任务，并异步执行setPhase("loading")。（异步的目的是保证waiting的style能够被作为初始style）

- num/errorNum  
  加载资源的统计：加载结束（包括错误）/加载错误数量。  
    
  在useEffect(...,[num])中，当num === fileList.length时执行setPhase("loaded")推进流程。此外根据num/fileList.length进行加载条样式调整。  

- tipNo  
  当前显示tip的编号。
  
 #### 组件内部function
 - preload()
 - changeTip()
 - phase_style_update()  
   根据当前phase更新style。新的style在phase_style_delta中被预设。
   
 #### DOM
 标签结构：
 - LoadingP
    - body
       - body-inner
          - load-bar
       - header(显示上仅是覆盖的色块）
       - footer(同上）
       - word（fixed定位的一系列文字显示）
          ...
