   M S B A M L   `   `   `  ����   MandADiscoverySuite*    $MandADiscoverySuite.PowerShellWindow   W SPresentationCore, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=6.0.2.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35^ ZWindowsFormsIntegration, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35H 9http://schemas.microsoft.com/winfx/2006/xaml/presentation      R NSystem.Xaml, Version=6.0.2.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml       � Title$  PowerShell Execution��$	��600��$	��900�� � WindowStartupLocation$ CenterOwner=����	#FF0F1419 � 
ResizeMode$ 	CanResize=� � 	Resources    PrimaryGradient �� 
StartPoint �� EndPoint � Color � Offset  ModernButtonStyle �� 
TargetType	 �� Property
 �� Value �� 
TargetType �� CornerRadius �� Padding J� Effect3  -System.Windows.Media.Effects.DropShadowEffect   Color   	Direction   ShadowDepth   
BlurRadius   Opacity �� Triggers P� Property P� Value��%�  &	        &	 V     7   �� $	 0,0&�$	 1,1&�.��� $ 	#FF1e3c72��$ 0Q�� $ 	#FF2a5298��$ 1Q��� " ��.��� 	 � ��8
   �� 	 � ��

 ������� 	 � ��$
 0q��� 	 � ��$

 16,8q��� 	 � ��$
 14(��� 	 � ��$
 Medium"��� 	 �@�Cursor$

 Hand���� 	 � ��
 �� " ��.R��� #��z��$ 6��# z��._��� $��Center=�$��Center=�   $ 	#FF000000��$	 270Q�$ 2Q�$ 8Q�$	 0.2Q� P�  �@J�IsMouseOver$
 True��. ��� 	 � ��
 �� $	 0,0&�$	 1,1&�.��� $ 	#FF2a4c82��$ 0Q�� $ 	#FF3a62a8��$ 1Q�P�  � ��$
 True��. ��� 	 � ��
 �� $	 0,0&�$	 1,1&�.��� $ 	#FF1a2c52��$ 0Q�� $ 	#FF2a4278��$ 1Q�.��� $��20q� � RowDefinitions �� $
��Auto ��� $
��Auto ��� $��* ��� $
��Auto ��� $
��Auto �.+��� -    ��Name$ WindowTitle��$��0��$!��PowerShell Script Execution�����	#FFF7FAFC$��20(�$��SemiBold"�$��0,0,0,16q��� $��1�����	#FF2D3748$ 8��$ 16q�$��0,0,0,16q�._��� .+��� -   $ 
ScriptName��$0��*Script: DiscoveryCreateAppRegistration.ps1�����	#FF4299E1$��14(�$��Medium"�$��0,0,0,8q��� -   $ ScriptDescription��$d��^Creates Azure AD app registration with comprehensive permissions for M&A environment discovery�����	#FFE2E8F0$��12(�$
��Wrap=��� $��2�����	#FF1A202C$ 8�����	#FF4A5568$��1q�._��� -    ��Name$ OutputScrollViewer��$
��Auto=�$��12q�.���� -    ��Name$ 
OutputText��$��Consolas)�$��12(����	#FFE2E8F0 �� TextWrapping$
 Wrap=�
������ $��0q� �� 
IsReadOnly$
 True�� �� SelectionBrush �	#FF4299E1" �� VerticalScrollBarVisibility$ Disabled=�$ �� HorizontalScrollBarVisibility$ Disabled=�.��  � ContextMenu  �� ���	#FF2D3748���	#FFE2E8F0.@�m� -   $��
Select All��! m� InputGestureText$! Ctrl+A��m� -   $
��Copy��$! Ctrl+C��m� -   $��Copy All Output��$! Ctrl+Shift+C��.��� -	   " �Name$" ExecutionProgress��$��3��$��4�����	#FF2D3748���	#FF4299E1$��	0,12,0,12q�$y�	Collapsed=��� $��4��# �� Orientation$# 
Horizontal=�$��Right=�.+��� -
   $ ��Name$$ 	RunButton��$��▶ Run Script��#��[ $��0,0,12,0q����	#FF48BB78�� -   $$ 
StopButton��$��⏹ Stop��#��[ $��0,0,12,0q�${�False�����	#FFF56565�� -   $$ 
CopyButton��$��📋 Copy Output��#��[ $��0,0,12,0q����	#FF4299E1�� -   $$ ClearButton��$��
🗑 Clear��#��[ $��0,0,12,0q����	#FF718096�� -   $$ CloseButton��$��	✖ Close��#��[ ���	#FF4A5568