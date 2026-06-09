export interface LocalePack {
  designer: {
    canvasToolbar: {
      desktop: string
      mobile: string
      componentTree: string
      close: string
      undo: string
      redo: string
    }
    canvasEmptyHint: string
    emptyContainerPlaceholder: string
    fieldList: {
      title: string
    }
    propertyPanel: {
      title: string
      fieldName: string
      fieldLabel: string
      fieldLabelPlaceholder: string
      showLabel: string
      hideLabel: string
      defaultValue: string
      defaultValuePlaceholder: string
      containerHint: string
      advancedProps: string
      colSpan: string
      disabled: string
      readOnly: string
      hidden: string
      hiddenPlaceholder: string
      events: string
      expressionPlaceholder: string
      jsonPlaceholder: string
      codePlaceholder: string
    }
    eventHandler: {
      notConfigured: string
      expression: string
      action: string
      callback: string
      expressionLabel: string
      expressionHelp: string
      expressionPlaceholder: string
      actionLabel: string
      actionParams: string
      actionParamsPlaceholder: string
      callbackNameLabel: string
      callbackNamePlaceholder: string
    }
    rules: {
      custom: string
      phone: string
      idCard: string
      email: string
      url: string
      title: string
      required: string
      errorMessage: string
      errorMessagePlaceholder: string
      regex: string
      regexPlaceholder: string
      regexPresets: string
    }
    formConfig: {
      pageBg: string
      bgPlaceholder: string
      labelWidth: string
      controlWidth: string
      title: string
      showColon: string
      requiredMark: string
      desktopConfig: string
      layoutMode: string
      labelAlign: string
      controlVariant: string
      mobileConfig: string
      horizontal: string
      vertical: string
      inline: string
      leftAlign: string
      rightAlign: string
      outline: string
      filled: string
      borderless: string
      underline: string
      default: string
      optionalMark: string
      hidden: string
    }
    paletteGroups: {
      textInput: string
      number: string
      select: string
      dateTime: string
      layout: string
      display: string
      other: string
    }
    fieldActions: {
      copy: string
      delete: string
      dragSort: string
    }
    staticExpressionToggle: {
      switchToExpression: string
      switchToStatic: string
      funcIcon: string
      staticIcon: string
      expressionPlaceholder: string
    }
  }

  component: {
    input: {
      label: string
      allowClear: string
      maxLength: string
      prefix: string
      suffix: string
      addonBefore: string
      addonAfter: string
      autoComplete: string
      type: string
      placeholder: string
      prefixPlaceholder: string
      autoCompletePlaceholder: string
      text: string
      email: string
      phone: string
      url: string
      events: {
        onChange: { label: string; description: string }
        onBlur: { label: string; description: string }
        onFocus: { label: string; description: string }
        onPressEnter: { label: string; description: string }
      }
    }
    inputNumber: {
      label: string
      min: string
      max: string
      step: string
      precision: string
      prefix: string
      suffix: string
      prefixPlaceholder: string
      suffixPlaceholder: string
      events: {
        onChange: { label: string; description: string }
        onBlur: { label: string; description: string }
        onPressEnter: { label: string; description: string }
      }
    }
    textarea: {
      label: string
      placeholder: string
      rows: string
      autoSize: string
      minRows: string
      maxRows: string
      maxLength: string
      events: {
        onChange: { label: string; description: string }
        onFocus: { label: string; description: string }
        onBlur: { label: string; description: string }
        onPressEnter: { label: string; description: string }
      }
    }
    password: {
      label: string
      allowClear: string
      placeholder: string
      placeholderValue: string
      maxLength: string
      prefix: string
    }
    select: {
      label: string
      modeDefault: string
      modeMultiple: string
      modeTags: string
      dataSource: string
      allowClear: string
      mode: string
      maxTagCount: string
      notFoundContent: string
      notFoundContentPlaceholder: string
      defaultOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
        onSearch: { label: string; description: string }
        onFocus: { label: string; description: string }
        onBlur: { label: string; description: string }
        onDropdownVisibleChange: { label: string; description: string }
      }
    }
    radio: {
      label: string
      dataSource: string
      optionType: string
      buttonStyle: string
      direction: string
      defaultType: string
      button: string
      border: string
      solid: string
      horizontal: string
      vertical: string
      defaultOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    checkbox: {
      label: string
      dataSource: string
      indeterminate: string
      direction: string
      horizontal: string
      vertical: string
      defaultOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    cascader: {
      label: string
      dataSource: string
      placeholder: string
      placeholderValue: string
      allowClear: string
      searchable: string
      expandTrigger: string
      click: string
      hover: string
      defaultOptionTemplate: string
      defaultSubOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
        onPopupVisibleChange: { label: string; description: string }
      }
    }
    treeSelect: {
      label: string
      dataSource: string
      placeholder: string
      placeholderValue: string
      allowClear: string
      searchable: string
      multiple: string
      treeCheckable: string
      defaultOptionTemplate: string
      defaultSubOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
        onSearch: { label: string; description: string }
      }
    }
    segment: {
      label: string
      dataSource: string
      defaultValue: string
      size: string
      block: string
      disabled: string
      placeholder: string
      large: string
      medium: string
      small: string
      defaultOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    slider: {
      label: string
      defaultValue: string
      min: string
      max: string
      step: string
      formatter: string
      formatterPlaceholder: string
      defaultPlaceholder: string
      events: {
        onChange: { label: string; description: string }
        onAfterChange: { label: string; description: string }
      }
    }
    rate: {
      label: string
      defaultValue: string
      count: string
      character: string
      tooltips: string
      characterPlaceholder: string
      tooltipsPlaceholder: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    switch: {
      label: string
      defaultChecked: string
      size: string
      checkedText: string
      uncheckedText: string
      defaultSize: string
      smallSize: string
      checkedPlaceholder: string
      uncheckedPlaceholder: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    datePicker: {
      label: string
      allowClear: string
      format: string
      picker: string
      minDate: string
      maxDate: string
      disabledDate: string
      disabledDatePlaceholder: string
      unlimited: string
      today: string
      yesterday: string
      tomorrow: string
      lastWeek: string
      nextWeek: string
      lastMonth: string
      nextMonth: string
      date: string
      week: string
      month: string
      quarter: string
      year: string
      events: {
        onChange: { label: string; description: string }
        onCalendarChange: { label: string; description: string }
        onOpenChange: { label: string; description: string }
        onPanelChange: { label: string; description: string }
        onOk: { label: string; description: string }
      }
    }
    dateRange: {
      label: string
      defaultValue: string
      format: string
      picker: string
      showTime: string
      startPlaceholder: string
      endPlaceholder: string
      allowClear: string
      date: string
      week: string
      month: string
      year: string
      events: {
        onChange: { label: string; description: string }
        onCalendarChange: { label: string; description: string }
        onOpenChange: { label: string; description: string }
        onPanelChange: { label: string; description: string }
        onOk: { label: string; description: string }
      }
    }
    dateTime: {
      label: string
      allowClear: string
      format: string
      formatPlaceholder: string
      picker: string
      events: {
        onChange: { label: string; description: string }
        onCalendarChange: { label: string; description: string }
        onOpenChange: { label: string; description: string }
        onPanelChange: { label: string; description: string }
        onOk: { label: string; description: string }
      }
    }
    timePicker: {
      label: string
      allowClear: string
      format: string
      formatPlaceholder: string
      minuteStep: string
      secondStep: string
      events: {
        onChange: { label: string; description: string }
        onOpenChange: { label: string; description: string }
      }
    }
    button: {
      label: string
      size: string
      btnType: string
      icon: string
      text: string
      block: string
      danger: string
      loading: string
      small: string
      medium: string
      large: string
      default: string
      primary: string
      dashed: string
      link: string
      textType: string
      iconPlaceholder: string
      textPlaceholder: string
      defaultContent: string
      events: {
        onClick: { label: string; description: string }
      }
    }
    title: {
      label: string
      content: string
      contentPlaceholder: string
      defaultContent: string
      level: string
      type: string
      align: string
      bold: string
      italic: string
      underline: string
      mark: string
      default: string
      secondary: string
      success: string
      warning: string
      danger: string
      left: string
      center: string
      right: string
    }
    text: {
      label: string
      content: string
      contentPlaceholder: string
      defaultContent: string
      type: string
      fontSize: string
      fontSizePlaceholder: string
      align: string
      keyboard: string
      bold: string
      italic: string
      underline: string
      strikethrough: string
      code: string
      mark: string
      ellipsis: string
    }
    alert: {
      label: string
      type: string
      title: string
      content: string
      showIcon: string
      closable: string
      customIcon: string
      titlePlaceholder: string
      contentPlaceholder: string
      none: string
      primary: string
      info: string
      success: string
      warning: string
      error: string
      events: {
        onClose: { label: string; description: string }
      }
    }
    card: {
      label: string
      title: string
      titlePlaceholder: string
      icon: string
      bordered: string
      size: string
      bodyPadding: string
      bodyGap: string
      events: Record<string, { label: string; description?: string }>
    }
    divider: {
      label: string
      direction: string
      textPosition: string
      plain: string
      textContent: string
      textContentPlaceholder: string
      color: string
      colorPlaceholder: string
      weight: string
      horizontal: string
      vertical: string
      center: string
      left: string
      right: string
    }
    grid: {
      label: string
      layoutMode: string
      gap: string
      padding: string
      margin: string
      columnMgmt: string
      grid: string
      flex: string
      addColumn: string
      columnWidth: string
    }
    flex: {
      label: string
      direction: string
      justify: string
      align: string
      gap: string
      wrap: string
      padding: string
      margin: string
      wrapNoWrap: string
      wrapWrap: string
      wrapReverse: string
      justifyFlexStart: string
      justifyCenter: string
      justifyFlexEnd: string
      justifySpaceBetween: string
      justifySpaceAround: string
      justifySpaceEvenly: string
      alignStretch: string
      alignFlexStart: string
      alignCenter: string
      alignFlexEnd: string
      alignBaseline: string
      directionRow: string
      directionRowReverse: string
      directionColumn: string
      directionColumnReverse: string
    }
    collapse: {
      label: string
      accordion: string
      ghost: string
      defaultActive: string
      defaultActivePlaceholder: string
      panelMgmt: string
      header: string
      key: string
      disabled: string
      addPanel: string
      defaultPanelHeader: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    tabs: {
      label: string
      type: string
      size: string
      position: string
      centered: string
      tabMgmt: string
      line: string
      card: string
      editableCard: string
      large: string
      medium: string
      small: string
      top: string
      right: string
      bottom: string
      left: string
      title: string
      key: string
      disabled: string
      addTab: string
      defaultTabTitle: string
      events: {
        onChange: { label: string; description: string }
      }
    }
    subForm: {
      label: string
      rowMode: string
      fixedRows: string
      columnMgmt: string
      dynamic: string
      fixed: string
      columnTitle: string
      columnWidth: string
      addColumn: string
      defaultColumnLabel: string
    }
    upload: {
      label: string
      action: string
      actionPlaceholder: string
      defaultValue: string
      accept: string
      maxCount: string
      listType: string
      showUploadList: string
      list: string
      card: string
      events: {
        onChange: { label: string; description: string }
        onRemove: { label: string; description: string }
      }
    }
    html: { label: string; content: string; contentPlaceholder: string }
    jsx: { label: string; code: string; codePlaceholder: string; compile: string; compiling: string; compileSuccess: string; compileError: string }
    steps: { label: string }
    tag: { label: string }
    table: { label: string }
    form: { label: string }
    transfer: {
      label: string
      defaultOptionTemplate: string
      events: {
        onChange: { label: string; description: string }
        onSearch: { label: string; description: string }
      }
    }
    image: {
      label: string
      src: string
      srcPlaceholder: string
      alt: string
      altPlaceholder: string
      width: string
      height: string
      sizePlaceholder: string
      preview: string
      radius: string
      events: {
        onError: { label: string; description: string }
      }
    }
  }

  widget: {
    modal: {
      confirm: string
      cancel: string
    }
    select: {
      placeholder: string
      clear: string
      noOptions: string
    }
    expressionInput: {
      title: string
      availableFields: string
      editButton: string
    }
    dataSourceEditor: {
      batchEdit: string
      batchInstructions: string
      remoteDataSource: string
      apiUrl: string
      apiUrlPlaceholder: string
      paramHelp: string
      dependentField: string
      reloadHelp: string
      responseMapping: string
      listPath: string
      listPathPlaceholder: string
      labelField: string
      labelFieldPlaceholder: string
      valueField: string
      valueFieldPlaceholder: string
      staticData: string
      remoteData: string
      labelCol: string
      valueCol: string
      addOption: string
      batchEditBtn: string
      configRemote: string
      none: string
    }
    treeDataEditor: {
      title: string
      instructions: string
      batchEdit: string
      empty: string
      nodeCount: string
      layers: string
    }
    sortableTableEditor: {
      delete: string
      minItems: string
    }
    sortableList: {
      delete: string
    }
    colorPicker: {
      clear: string
    }
    codeEditor: {
      title: string
      lines: string
      fullscreen?: string
      exitFullscreen?: string
      compile?: string
      compiling?: string
      compileSuccess?: string
      compileError?: string
    }
  }

  validation: {
    required: string
    typeError: {
      string: string
      number: string
      boolean: string
    }
    email: string
    url: string
    phone: string
    pattern: string
  }

  adapter: {
    common: {
      placeholder: {
        input: string
        select: string
        date: string
        time: string
        number: string
        search: string
      }
    }
    antd: {
      subForm: {
        empty: string
        operation: string
        delete: string
        addRow: string
      }
      upload: {
        button: string
      }
    }
    mobile: {
      confirm: string
      cancel: string
      dateRangeStart: string
      dateRangeEnd: string
      subForm: {
        empty: string
        delete: string
        addRow: string
      }
      image: {
        empty: string
      }
    }
  }
}
